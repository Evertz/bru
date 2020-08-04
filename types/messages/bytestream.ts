import { Long } from 'long';
import { ServerReadableStream } from 'grpc';
import { Observable } from 'rxjs';

// #### Introduction
//
// The Byte Stream API enables a client to read and write a stream of bytes to
// and from a resource. Resources have names, and these names are supplied in
// the API calls below to identify the resource that is being read from or
// written to.
//
// All implementations of the Byte Stream API export the interface defined here:
//
// * `Read()`: Reads the contents of a resource.
//
// * `Write()`: Writes the contents of a resource. The client can call `Write()`
//   multiple times with the same resource and can check the status of the write
//   by calling `QueryWriteStatus()`.
//
// #### Service parameters and metadata
//
// The ByteStream API provides no direct way to access/modify any metadata
// associated with the resource.
//
// #### Errors
//
// The errors returned by the service are in the Google canonical error space.


// Request object for ByteStream.Read.
export interface ReadRequest {
  // The name of the resource to read.
  resourceName: string;

  // The offset for the first byte to return in the read, relative to the start
  // of the resource.
  //
  // A `read_offset` that is negative or greater than the size of the resource
  // will cause an `OUT_OF_RANGE` error.
  readOffset: Long;

  // The maximum number of `data` bytes the server is allowed to return in the
  // sum of all `ReadResponse` messages. A `read_limit` of zero indicates that
  // there is no limit, and a negative `read_limit` will cause an error.
  //
  // If the stream returns fewer bytes than allowed by the `read_limit` and no
  // error occurred, the stream includes all data from the `read_offset` to the
  // end of the resource.
  readLimit: Long;
}

// Response object for ByteStream.Read.
export interface ReadResponse {
  // A portion of the data for the resource. The service **may** leave `data`
  // empty for any given `ReadResponse`. This enables the service to inform the
  // client that the request is still live while it is running an operation to
  // generate more data.
  data: Buffer;
}

// Request object for ByteStream.Write.
export interface WriteRequest {
  // The name of the resource to write. This **must** be set on the first
  // `WriteRequest` of each `Write()` action. If it is set on subsequent calls,
  // it **must** match the value of the first request.
  resourceName: string;

  // The offset from the beginning of the resource at which the data should be
  // written. It is required on all `WriteRequest`s.
  //
  // In the first `WriteRequest` of a `Write()` action, it indicates
  // the initial offset for the `Write()` call. The value **must** be equal to
  // the `committed_size` that a call to `QueryWriteStatus()` would return.
  //
  // On subsequent calls, this value **must** be set and **must** be equal to
  // the sum of the first `write_offset` and the sizes of all `data` bundles
  // sent previously on this stream.
  //
  // An incorrect value will cause an error.
  writeOffset: Long;

  // If `true`, this indicates that the write is complete. Sending any
  // `WriteRequest`s subsequent to one in which `finish_write` is `true` will
  // cause an error.
  finishWrite: boolean;

  // A portion of the data for the resource. The client **may** leave `data`
  // empty for any given `WriteRequest`. This enables the client to inform the
  // service that the request is still live while it is running an operation to
  // generate more data.
  data: Buffer;
}

// Response object for ByteStream.Write.
export interface WriteResponse {
  // The number of bytes that have been processed for the given resource.
  committedSize: Long;
}

// Request object for ByteStream.QueryWriteStatus.
export interface QueryWriteStatusRequest {
  // The name of the resource whose write status is being requested.
  resourceName: string;
}

// Response object for ByteStream.QueryWriteStatus.
export interface QueryWriteStatusResponse {
  // The number of bytes that have been processed for the given resource.
  committedSize: Long;

  // `complete` is `true` only if the client has sent a `WriteRequest` with
  // `finish_write` set to true, and the server has processed that request.
  complete: boolean;
}


export interface ByteStream {
  // `Read()` is used to retrieve the contents of a resource as a sequence
  // of bytes. The bytes are returned in a sequence of responses, and the
  // responses are delivered as the results of a server-side streaming RPC.
  read(request: ReadRequest): Observable<ReadResponse>;

  // `Write()` is used to send the contents of a resource as a sequence of
  // bytes. The bytes are sent in a sequence of request protos of a client-side
  // streaming RPC.
  //
  // A `Write()` action is resumable. If there is an error or the connection is
  // broken during the `Write()`, the client should check the status of the
  // `Write()` by calling `QueryWriteStatus()` and continue writing from the
  // returned `committed_size`. This may be less than the amount of data the
  // client previously sent.
  //
  // Calling `Write()` on a resource name that was previously written and
  // finalized could cause an error, depending on whether the underlying service
  // allows over-writing of previously written resources.
  //
  // When the client closes the request channel, the service will respond with
  // a `WriteResponse`. The service will not view the resource as `complete`
  // until the client has sent a `WriteRequest` with `finish_write` set to
  // `true`. Sending any requests on a stream after sending a request with
  // `finish_write` set to `true` will cause an error. The client **should**
  // check the `WriteResponse` it receives to determine how much data the
  // service was able to commit and whether the service views the resource as
  // `complete` or not.
  write(request$: ServerReadableStream<WriteRequest>,
        callback: (err: any, response: WriteResponse) => void): any;

  // `QueryWriteStatus()` is used to find the `committed_size` for a resource
  // that is being written, which can then be used as the `write_offset` for
  // the next `Write()` call.
  //
  // If the resource does not exist (i.e., the resource has been deleted, or the
  // first `Write()` has not yet reached the service), this method returns the
  // error `NOT_FOUND`.
  //
  // The client **may** call `QueryWriteStatus()` at any time to determine how
  // much data has been processed for this resource. This is useful if the
  // client is buffering data and needs to know which data can be safely
  // evicted. For any sequence of `QueryWriteStatus()` calls for a given
  // resource name, the sequence of returned `committed_size` values will be
  // non-decreasing.
  queryWriteStatus(request: QueryWriteStatusRequest): QueryWriteStatusResponse;
}
