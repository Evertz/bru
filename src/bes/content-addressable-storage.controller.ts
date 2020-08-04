import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  BatchReadBlobsRequest,
  BatchReadBlobsResponse,
  BatchReadBlobsResponse$Response,
  BatchUpdateBlobsRequest,
  BatchUpdateBlobsResponse,
  BatchUpdateBlobsResponse$Response,
  ContentAddressableStorage,
  FindMissingBlobsRequest,
  FindMissingBlobsResponse,
  GetTreeRequest,
  GetTreeResponse
} from '../../types/messages/remote-execution';
import { RpcStatusCode } from '../../types/messages/status';
import { PersistenceService } from '../persistence/persistence.service';

@Controller()
export class ContentAddressableStorageController implements ContentAddressableStorage {
  private readonly logger = new Logger(ContentAddressableStorageController.name);

  constructor(private readonly persistenceService: PersistenceService) {}

  @GrpcMethod('ContentAddressableStorage', 'BatchReadBlobs')
  batchReadBlobs(request: BatchReadBlobsRequest): BatchReadBlobsResponse {
    this.logger.verbose(`CAS request for ${request.digests.length} blobs`);

    const responses: BatchReadBlobsResponse$Response[] = request.digests.map(digest => {
      const data = this.persistenceService.fetchBuildArtifact(digest.hash);
      const response: any = {
        digest
      };

      if (data) {
        response.data = data;
        response.status = {
          code: RpcStatusCode.OK
        }
      } else {
        response.status = {
          code: RpcStatusCode.NOT_FOUND
        }
      }

      return response;
    });

    return { responses };
  }

  @GrpcMethod('ContentAddressableStorage', 'BatchUpdateBlobs')
  batchUpdateBlobs(request: BatchUpdateBlobsRequest): BatchUpdateBlobsResponse {
    this.logger.verbose(`CAS request to update ${request.request.length} blobs`);

    const responses: BatchUpdateBlobsResponse$Response[] = request.request.map(update => {
      this.persistenceService.persistBuildArtifact(update.digest.hash, update.data);

      return {
        digest: update.digest,
        status: {
          code: RpcStatusCode.OK
        }
      };
    });

    return { responses };
  }

  @GrpcMethod('ContentAddressableStorage', 'FindMissingBlobs')
  findMissingBlobs(request: FindMissingBlobsRequest): FindMissingBlobsResponse {
    const missingBlobDigests = request.blobDigests.filter(digest => !this.persistenceService.hasBuildArtifact(digest.hash));
    return { missingBlobDigests };
  }

  @GrpcMethod('ContentAddressableStorage', 'GetTree')
  getTree(request: GetTreeRequest): Observable<GetTreeResponse> {
    this.logger.log(`Request for getTree`);
    return undefined;
  }

}
