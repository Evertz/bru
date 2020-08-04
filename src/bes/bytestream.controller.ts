import { WriteStream, createReadStream } from 'fs';

import { Controller, Get, HttpException, HttpStatus, Logger, Param, Response } from '@nestjs/common';
import { GrpcMethod, GrpcStreamCall, RpcException } from '@nestjs/microservices';

import * as FileType from 'file-type/browser';
import { ServerReadableStream } from 'grpc';
import { Observable, Subject } from 'rxjs';
import { fromNumber as longFromNumber } from 'long';
import { Readable } from 'stream';

import {
  ByteStream,
  QueryWriteStatusRequest,
  QueryWriteStatusResponse,
  ReadRequest, ReadResponse, WriteRequest, WriteResponse
} from '../../types/messages/bytestream';
import { Digest } from '../../types/messages/remote-execution';
import { RpcStatusCode } from '../../types/messages/status';
import { PersistenceService } from '../persistence/persistence.service';

class StreamWriter {
  private committedSize = 0;

  constructor(private readonly resourceName: string,
              private readonly hash: string,
              private readonly expectedSize: number,
              private readonly writeStream: WriteStream,
              private readonly logger: Logger) {
  }

  write(data: Buffer, byteOffset = 0, cb: (err?) => void) {
    if (this.committedSize === 0 && byteOffset !== 0) {
      // #first
      const err = `Expected first byte offset to be 0, but got ${byteOffset}`;
      this.logger.error(err);
      throw new Error(err);
    }

    if (this.committedSize !== byteOffset) {
      const err = `Expected byte offset of ${this.committedSize}, but got ${byteOffset}`;
      this.logger.error(err);
      throw new Error(err);
    }

    this.writeStream.write(data, cb);
    this.committedSize = this.committedSize + data.length;
  }

  getSize(): number {
    return this.committedSize;
  }

  getResource() {
    return this.resourceName;
  }

  getHash() {
    return this.hash;
  }

  close() {
    this.writeStream.end();
  }
}

@Controller()
export class BytestreamController implements ByteStream {
  private readonly logger = new Logger(BytestreamController.name);

  private static readonly WRITE_REG =
    new RegExp(/^(?:(.*?)\/)?uploads\/([a-f0-9-]{36})\/blobs\/([a-f0-9]{64})\/(\d+)$/);

  private static readonly READ_REG =
    new RegExp(/^(?:(.*?)\/)?blobs\/([a-f0-9]{64})\/(\d+)$/);

  private readonly writers: Map<string, StreamWriter> = new Map();

  constructor(private readonly persistenceService: PersistenceService) {}

  @Get('/blobs/:hash/:size/:name')
  async getBlob(@Param('hash') hash: string,
          @Param('size') size: string,
          @Param('name') name: string,
          @Response() response) {
    const data = this.persistenceService.fetchBuildArtifact(hash);
    if (!data) {
      throw new HttpException(`Blob for ${hash} not found`, HttpStatus.NOT_FOUND);
    }

    if (Number(size) !== data.length) {
      throw new HttpException(
        `Expected size to be ${data.length}, but got ${size}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const type = await FileType.fromBuffer(data);

    response.set({
      'Content-Type': type ? type.mime : 'text/plain',
      'Content-Length': data.length,
    });

    const stream = new Readable();
    stream.push(data);
    stream.push(null);

    stream.pipe(response);
  }

  @GrpcMethod('ByteStream', 'QueryWriteStatus')
  queryWriteStatus(request: QueryWriteStatusRequest): QueryWriteStatusResponse {
    const extracted = this.extractDigestForWrite(request.resourceName);
    const hash = extracted.hash;

    if (!this.writers.has(hash)) {
      // no existing writer
      const data = this.persistenceService.fetchBuildArtifact(hash);
      if (!data) {
        return {
          committedSize: longFromNumber(0),
          complete: false,
        };
      } else {
        return {
          committedSize: longFromNumber(data.length),
          complete: true,
        };
      }
    }

    const writer = this.writers.get(hash);
    return {
      committedSize: longFromNumber(writer.getSize()),
      complete: false,
    };
  }

  @GrpcMethod('ByteStream', 'Read')
  read(request: ReadRequest): Observable<ReadResponse> {
    const stream$ = new Subject<ReadResponse>();

    process.nextTick(() => {
      if (!request.resourceName) {
        throw new RpcException({
          code: RpcStatusCode.INVALID_ARGUMENT,
          message: `Expected resource_name to be set, but got ${request.resourceName}`
        });
      }

      const readLimit = request.readLimit ? request.readLimit.toNumber() : undefined;
      const readOffset = request.readOffset ? request.readOffset.toNumber() : undefined;

      if (readLimit !== undefined && readLimit < 0) {
        throw new RpcException({
          code: RpcStatusCode.INVALID_ARGUMENT,
          message: `Expected read_limit to be greater that 0, but got ${readLimit}`
        });
      }

      if (readOffset !== undefined && readOffset < 0) {
        throw new RpcException({
          code: RpcStatusCode.INVALID_ARGUMENT,
          message: `Expected read_offset to be greater that 0, but got ${readOffset}`
        });
      }

      const extracted = this.extractDigestForRead(request.resourceName);
      const hash = extracted.hash;

      this.logger.verbose(`Request to read ${hash}`);

      const buffer = this.persistenceService.fetchBuildArtifact(hash);
      if (!buffer) {
        // shouldn't get here
        this.logger.error(`Cache miss on ${hash}`);
        throw new RpcException({
          code: RpcStatusCode.NOT_FOUND,
          message: `Resource ${request.resourceName} not found`
        });
      }

      const sendingBuffer = Buffer.alloc(readLimit !== undefined ? readLimit : buffer.length);
      buffer.copy(sendingBuffer, 0, readOffset, readLimit);

      const response: ReadResponse = { data: sendingBuffer };
      stream$.next(response);
      stream$.complete();
    });

    return stream$.asObservable();
  }

  @GrpcStreamCall('ByteStream', 'Write')
  write(request$: ServerReadableStream<WriteRequest>,
        callback: (err: any, response: WriteResponse) => void): WriteResponse {

    let writer: StreamWriter;
    request$.on('data', (data: WriteRequest) => {
      if (!writer) {
        if (!data.resourceName) {
          callback(new RpcException({
            code: RpcStatusCode.INVALID_ARGUMENT,
            message: `Expected resource_name to be set on the initial request, but got ${data.resourceName}`
          }), null);
        }

        const extracted = this.extractDigestForWrite(data.resourceName);
        const hash = extracted.hash;

        // first request, but we might already have the buffer
        const existing = this.persistenceService.fetchBuildArtifact(hash);
        if (existing) {
          callback(null, { committedSize: longFromNumber(Buffer.byteLength(existing)) });
          return;
        }

        // is this a resume of a previous upload?
        if (this.writers.has(hash)) {
          this.logger.verbose(`Resuming existing upload of ${data.resourceName}`);
          writer = this.writers.get(hash);
        } else {
          const stream = this.persistenceService.persistBuildArtifact(hash);
          writer = new StreamWriter(data.resourceName, hash, extracted.size_bytes, stream, this.logger);
          this.writers.set(writer.getHash(), writer);
        }
      }

      if (data.resourceName && data.resourceName !== writer.getResource()) {
        callback(new RpcException({
          code: RpcStatusCode.INVALID_ARGUMENT,
          message: `Expected resource_name to match initial request, but got ${data.resourceName}`
        }), null);
      }

      try {
        writer.write(data.data, data.writeOffset?.toNumber(), err => {
          if (data.finishWrite) {
            this.logger.verbose(`Written ${writer.getHash()}`);

            writer.close();
            this.writers.delete(writer.getHash());
            callback(null, { committedSize: longFromNumber(writer.getSize()) });
          }
        });
      } catch (e) {
        callback(new RpcException({
          code: RpcStatusCode.INVALID_ARGUMENT,
          message: e.message
        }), null);
      }
    });

    return undefined;
  }

  private extractDigestForRead(resourceName: string): Digest & { instanceName: string } {
    // 1 - instance name
    // 2 - hash
    // 3 - size
    const matches = BytestreamController.READ_REG.exec(resourceName);

    return {
      hash: matches[2],
      size_bytes: Number(matches[3]),
      instanceName: matches[1]
    }
  }

  private extractDigestForWrite(resourceName: string): Digest & { instanceName: string } {
    // 1 - instance name
    // 2 - uuid
    // 3 - hash
    // 4 - size
    const matches = BytestreamController.WRITE_REG.exec(resourceName);

    return {
      hash: matches[3],
      size_bytes: Number(matches[4]),
      instanceName: matches[1]
    }
  }

}
