import { Observable } from 'rxjs';

import { SemVer } from './semver';
import { RpcStatus } from './status';
import { Timestamp } from './timestamp';

export enum SymlinkAbsolutePathStrategyValue {
  // Invalid value.
  UNKNOWN = 0,

  // Server will return an `INVALID_ARGUMENT` on input symlinks with absolute
  // targets.
  // If an action tries to create an output symlink with an absolute target, a
  // `FAILED_PRECONDITION` will be returned.
  DISALLOWED = 1,

  // Server will allow symlink targets to escape the input root tree, possibly
  // resulting in non-hermetic builds.
  ALLOWED = 2
}

// Describes how the server treats absolute symlink targets.
export interface SymlinkAbsolutePathStrategy {}

export enum DigestFunctionValue {
  // It is an error for the server to return this value.
  UNKNOWN = 0,

  // The SHA-256 digest function.
  SHA256 = 1,

  // The SHA-1 digest function.
  SHA1 = 2,

  // The MD5 digest function.
  MD5 = 3,

  // The Microsoft "VSO-Hash" paged SHA256 digest function.
  // See https://github.com/microsoft/BuildXL/blob/master/Documentation/Specs/PagedHash.md .
  VSO = 4,

  // The SHA-384 digest function.
  SHA384 = 5,

  // The SHA-512 digest function.
  SHA512 = 6
}

// The digest function used for converting values into keys for CAS and Action
// Cache.
export interface DigestFunction {}

// Describes the server/instance capabilities for updating the action cache.
export interface ActionCacheUpdateCapabilities {
  updateEnabled: boolean;
}

// Supported range of priorities, including boundaries.
export interface PriorityRange {
  minPriority: number;
  maxPriority: number;
}

// Allowed values for priority in
// [ResultsCachePolicy][google.devtools.remoteexecution.v2.ResultsCachePolicy]
// Used for querying both cache and execution valid priority ranges.
export interface PriorityCapabilities {
  // Supported range of priorities, including boundaries.
  priorities: PriorityRange[];
}

// Capabilities of the remote cache system.
interface CacheCapabilities {
  // All the digest functions supported by the remote cache.
  // Remote cache may support multiple digest functions simultaneously.
  digestFunction: DigestFunctionValue[]

  // Capabilities for updating the action cache.
  actionCacheUpdateCapabilities: ActionCacheUpdateCapabilities

  // Supported cache priority range for both CAS and ActionCache.
  cachePriorityCapabilities: PriorityCapabilities

  // Maximum total size of blobs to be uploaded/downloaded using
  // batch methods. A value of 0 means no limit is set, although
  // in practice there will always be a message size limitation
  // of the protocol in use, e.g. GRPC.
  maxBatchTotalSizeBytes: number

  // Whether absolute symlink targets are supported.
  symlinkAbsolutePathStrategy: SymlinkAbsolutePathStrategyValue
}

// Capabilities of the remote execution system.
interface ExecutionCapabilities {
  // Remote execution may only support a single digest function.
  digestFunction: DigestFunctionValue

  // Whether remote execution is enabled for the particular server/instance.
  execEnabled: boolean

  // Supported execution priority range.
  executionPriorityCapabilities: PriorityCapabilities

  // Supported node properties.
  supportedNodeProperties: string[]
}

export interface ServerCapabilities {
  // Capabilities of the remote cache system.
  cacheCapabilities?: CacheCapabilities;

  // Capabilities of the remote execution system.
  executionCapabilities?: ExecutionCapabilities;

  // Earliest RE API version supported, including deprecated versions.
  deprecatedApiVersion?: SemVer;

  // Earliest non-deprecated RE API version supported.
  lowApiVersion: SemVer;

  // Latest RE API version supported.
  highApiVersion: SemVer
}

// A request message for
// [Capabilities.GetCapabilities][build.bazel.remote.execution.v2.Capabilities.GetCapabilities].
export interface GetCapabilitiesRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string;
}

// The Capabilities service may be used by remote execution clients to query
// various server properties, in order to self-configure or return meaningful
// error messages.
//
// The query may include a particular `instance_name`, in which case the values
// returned will pertain to that instance.
export interface Capabilities {
  // GetCapabilities returns the server capabilities configuration of the
  // remote endpoint.
  // Only the capabilities of the services supported by the endpoint will
  // be returned:
  // * Execution + CAS + Action Cache endpoints should return both
  //   CacheCapabilities and ExecutionCapabilities.
  // * Execution only endpoints should return ExecutionCapabilities.
  // * CAS + Action Cache only endpoints should return CacheCapabilities.
  getCapabilities(GetCapabilitiesRequest): ServerCapabilities;
}

// A request message for
// [ActionCache.GetActionResult][build.bazel.remote.execution.v2.ActionCache.GetActionResult].
export interface GetActionResultRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string;

  // The digest of the [Action][build.bazel.remote.execution.v2.Action]
  // whose result is requested.
  actionDigest: Digest;

  // A hint to the server to request inlining stdout in the
  // [ActionResult][build.bazel.remote.execution.v2.ActionResult] message.
  inlineStdout: boolean;

  // A hint to the server to request inlining stderr in the
  // [ActionResult][build.bazel.remote.execution.v2.ActionResult] message.
  inlineStderr: boolean;

  // A hint to the server to inline the contents of the listed output files.
  // Each path needs to exactly match one path in `output_files` in the
  // [Command][build.bazel.remote.execution.v2.Command] message.
  inlineOutputFiles: string[];
}

// An ActionResult represents the result of an
// [Action][build.bazel.remote.execution.v2.Action] being run.
export interface ActionResult {
  // reserved 1; // Reserved for use as the resource name.

  // The output files of the action. For each output file requested in the
  // `output_files` or `output_paths` field of the Action, if the corresponding
  // file existed after the action completed, a single entry will be present
  // either in this field, or the `output_file_symlinks` field if the file was
  // a symbolic link to another file (`output_symlinks` field after v2.1).
  //
  // If an output listed in `output_files` was found, but was a directory rather
  // than a regular file, the server will return a FAILED_PRECONDITION.
  // If the action does not produce the requested output, then that output
  // will be omitted from the list. The server is free to arrange the output
  // list as desired; clients MUST NOT assume that the output list is sorted.
  outputFiles: OutputFile[];

  // The output files of the action that are symbolic links to other files. Those
  // may be links to other output files, or input files, or even absolute paths
  // outside of the working directory, if the server supports
  // [SymlinkAbsolutePathStrategy.ALLOWED][build.bazel.remote.execution.v2.CacheCapabilities.SymlinkAbsolutePathStrategy].
  // For each output file requested in the `output_files` or `output_paths`
  // field of the Action, if the corresponding file existed after
  // the action completed, a single entry will be present either in this field,
  // or in the `output_files` field, if the file was not a symbolic link.
  //
  // If an output symbolic link of the same name as listed in `output_files` of
  // the Command was found, but its target type was not a regular file, the
  // server will return a FAILED_PRECONDITION.
  // If the action does not produce the requested output, then that output
  // will be omitted from the list. The server is free to arrange the output
  // list as desired; clients MUST NOT assume that the output list is sorted.
  //
  // DEPRECATED as of v2.1. Servers that wish to be compatible with v2.0 API
  // should still populate this field in addition to `output_symlinks`.
  outputFileSymlinks: OutputSymlink[];

  // New in v2.1: this field will only be populated if the command
  // `output_paths` field was used, and not the pre v2.1 `output_files` or
  // `output_directories` fields.
  // The output paths of the action that are symbolic links to other paths. Those
  // may be links to other outputs, or inputs, or even absolute paths
  // outside of the working directory, if the server supports
  // [SymlinkAbsolutePathStrategy.ALLOWED][build.bazel.remote.execution.v2.CacheCapabilities.SymlinkAbsolutePathStrategy].
  // A single entry for each output requested in `output_paths`
  // field of the Action, if the corresponding path existed after
  // the action completed and was a symbolic link.
  //
  // If the action does not produce a requested output, then that output
  // will be omitted from the list. The server is free to arrange the output
  // list as desired; clients MUST NOT assume that the output list is sorted.
  outputSymlinks: OutputSymlink[];

  // The output directories of the action. For each output directory requested
  // in the `output_directories` or `output_paths` field of the Action, if the
  // corresponding directory existed after the action completed, a single entry
  // will be present in the output list, which will contain the digest of a
  // [Tree][build.bazel.remote.execution.v2.Tree] message containing the
  // directory tree, and the path equal exactly to the corresponding Action
  // output_directories member.
  //
  // As an example, suppose the Action had an output directory `a/b/dir` and the
  // execution produced the following contents in `a/b/dir`: a file named `bar`
  // and a directory named `foo` with an executable file named `baz`. Then,
  // output_directory will contain (hashes shortened for readability):
  //
  // ```json
  // // OutputDirectory proto:
  // {
  //   path: "a/b/dir"
  //   tree_digest: {
  //     hash: "4a73bc9d03...",
  //     size: 55
  //   }
  // }
  // // Tree proto with hash "4a73bc9d03..." and size 55:
  // {
  //   root: {
  //     files: [
  //       {
  //         name: "bar",
  //         digest: {
  //           hash: "4a73bc9d03...",
  //           size: 65534
  //         }
  //       }
  //     ],
  //     directories: [
  //       {
  //         name: "foo",
  //         digest: {
  //           hash: "4cf2eda940...",
  //           size: 43
  //         }
  //       }
  //     ]
  //   }
  //   children : {
  //     // (Directory proto with hash "4cf2eda940..." and size 43)
  //     files: [
  //       {
  //         name: "baz",
  //         digest: {
  //           hash: "b2c941073e...",
  //           size: 1294,
  //         },
  //         is_executable: true
  //       }
  //     ]
  //   }
  // }
  // ```
  // If an output of the same name as listed in `output_files` of
  // the Command was found in `output_directories`, but was not a directory, the
  // server will return a FAILED_PRECONDITION.
  outputDirectories: OutputDirectory[];

  // The output directories of the action that are symbolic links to other
  // directories. Those may be links to other output directories, or input
  // directories, or even absolute paths outside of the working directory,
  // if the server supports
  // [SymlinkAbsolutePathStrategy.ALLOWED][build.bazel.remote.execution.v2.CacheCapabilities.SymlinkAbsolutePathStrategy].
  // For each output directory requested in the `output_directories` field of
  // the Action, if the directory existed after the action completed, a
  // single entry will be present either in this field, or in the
  // `output_directories` field, if the directory was not a symbolic link.
  //
  // If an output of the same name was found, but was a symbolic link to a file
  // instead of a directory, the server will return a FAILED_PRECONDITION.
  // If the action does not produce the requested output, then that output
  // will be omitted from the list. The server is free to arrange the output
  // list as desired; clients MUST NOT assume that the output list is sorted.
  //
  // DEPRECATED as of v2.1. Servers that wish to be compatible with v2.0 API
  // should still populate this field in addition to `output_symlinks`.
  outputDirectorySymlinks: OutputSymlink[];

  // The exit code of the command.
  exitCode: number;

  // The standard output buffer of the action. The server SHOULD NOT inline
  // stdout unless requested by the client in the
  // [GetActionResultRequest][build.bazel.remote.execution.v2.GetActionResultRequest]
  // message. The server MAY omit inlining, even if requested, and MUST do so if inlining
  // would cause the response to exceed message size limits.
  stdoutRaw: Uint8Array;

  // The digest for a blob containing the standard output of the action, which
  // can be retrieved from the
  // [ContentAddressableStorage][build.bazel.remote.execution.v2.ContentAddressableStorage].
  stdoutDigest: Digest;

  // The standard error buffer of the action. The server SHOULD NOT inline
  // stderr unless requested by the client in the
  // [GetActionResultRequest][build.bazel.remote.execution.v2.GetActionResultRequest]
  // message. The server MAY omit inlining, even if requested, and MUST do so if inlining
  // would cause the response to exceed message size limits.
  stderrRaw: Uint8Array;

  // The digest for a blob containing the standard error of the action, which
  // can be retrieved from the
  // [ContentAddressableStorage][build.bazel.remote.execution.v2.ContentAddressableStorage].
  stderrDigest: Digest;

  // The details of the execution that originally produced this result.
  executionMetadata: ExecutedActionMetadata;
}

// A request message for
// [ActionCache.UpdateActionResult][build.bazel.remote.execution.v2.ActionCache.UpdateActionResult].
export interface UpdateActionResultRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string;

  // The digest of the [Action][build.bazel.remote.execution.v2.Action]
  // whose result is being uploaded.
  actionDigest: Digest;

  // The [ActionResult][build.bazel.remote.execution.v2.ActionResult]
  // to store in the cache.
  actionResult: ActionResult;

  // An optional policy for the results of this execution in the remote cache.
  // The server will have a default policy if this is not provided.
  // This may be applied to both the ActionResult and the associated blobs.
  resultsCachePolicy: ResultsCachePolicy;
}

// An `OutputFile` is similar to a
// [FileNode][build.bazel.remote.execution.v2.FileNode], but it is used as an
// output in an `ActionResult`. It allows a full file path rather than
// only a name.
export interface OutputFile {
  // The full path of the file relative to the working directory, including the
  // filename. The path separator is a forward slash `/`. Since this is a
  // relative path, it MUST NOT begin with a leading forward slash.
  path: string;

  // The digest of the file's content.
  digest: Digest;

  // reserved 3; // Used for a removed field in an earlier version of the API.

  // True if file is executable, false otherwise.
  isExecutable: boolean;

  // The contents of the file if inlining was requested. The server SHOULD NOT inline
  // file contents unless requested by the client in the
  // [GetActionResultRequest][build.bazel.remote.execution.v2.GetActionResultRequest]
  // message. The server MAY omit inlining, even if requested, and MUST do so if inlining
  // would cause the response to exceed message size limits.
  contents: Uint8Array;

  // The supported node properties of the OutputFile, if requested by the Action.
  nodeProperties: NodeProperty[];
}

// A `Tree` contains all the
// [Directory][build.bazel.remote.execution.v2.Directory] protos in a
// single directory Merkle tree, compressed into one message.
export interface Tree {
  // The root directory in the tree.
  root: Directory;

  // All the child directories: the directories referred to by the root and,
  // recursively, all its children. In order to reconstruct the directory tree,
  // the client must take the digests of each of the child directories and then
  // build up a tree starting from the `root`.
  children: Directory[];
}

// An `OutputDirectory` is the output in an `ActionResult` corresponding to a
// directory's full contents rather than a single file.
export interface OutputDirectory {
  // The full path of the directory relative to the working directory. The path
  // separator is a forward slash `/`. Since this is a relative path, it MUST
  // NOT begin with a leading forward slash. The empty string value is allowed,
  // and it denotes the entire working directory.
  path: string;

  // reserved 2; // Used for a removed field in an earlier version of the API.

  // The digest of the encoded
  // [Tree][build.bazel.remote.execution.v2.Tree] proto containing the
  // directory's contents.
  treeDigest: Digest;
}

// An `OutputSymlink` is similar to a
// [Symlink][build.bazel.remote.execution.v2.SymlinkNode], but it is used as an
// output in an `ActionResult`.
//
// `OutputSymlink` is binary-compatible with `SymlinkNode`.
export interface OutputSymlink {
  // The full path of the symlink relative to the working directory, including the
  // filename. The path separator is a forward slash `/`. Since this is a
  // relative path, it MUST NOT begin with a leading forward slash.
  path: string;

  // The target path of the symlink. The path separator is a forward slash `/`.
  // The target path can be relative to the parent directory of the symlink or
  // it can be an absolute path starting with `/`. Support for absolute paths
  // can be checked using the [Capabilities][build.bazel.remote.execution.v2.Capabilities]
  // API. The canonical form forbids the substrings `/./` and `//` in the target
  // path. `..` components are allowed anywhere in the target path.
  target: string;

  // The supported node properties of the OutputSymlink, if requested by the
  // Action.
  nodeProperties: NodeProperty[];
}


// ExecutedActionMetadata contains details about a completed execution.
export interface ExecutedActionMetadata {
  // The name of the worker which ran the execution.
  worker: string;

  // When was the action added to the queue.
  queuedTimestamp: Timestamp;

  // When the worker received the action.
  workerStartTimestamp: Timestamp;

  // When the worker completed the action, including all stages.
  workerCompletedTimestamp: Timestamp;

  // When the worker started fetching action inputs.
  inputFetchStartTimestamp: Timestamp;

  // When the worker finished fetching action inputs.
  inputFetchCompletedTimestamp: Timestamp;

  // When the worker started executing the action command.
  executionStartTimestamp: Timestamp;

  // When the worker completed executing the action command.
  executionCompletedTimestamp: Timestamp;

  // When the worker started uploading action outputs.
  outputUploadStartTimestamp: Timestamp;

  // When the worker finished uploading action outputs.
  outputUploadCompletedTimestamp: Timestamp;
}

// An `ExecutionPolicy` can be used to control the scheduling of the action.
export interface ExecutionPolicy {
  // The priority (relative importance) of this action. Generally, a lower value
  // means that the action should be run sooner than actions having a greater
  // priority value, but the interpretation of a given value is server-
  // dependent. A priority of 0 means the *default* priority. Priorities may be
  // positive or negative, and such actions should run later or sooner than
  // actions having the default priority, respectively. The particular semantics
  // of this field is up to the server. In particular, every server will have
  // their own supported range of priorities, and will decide how these map into
  // scheduling policy.
  priority: number;
}

// A `ResultsCachePolicy` is used for fine-grained control over how action
// outputs are stored in the CAS and Action Cache.
export interface ResultsCachePolicy {
  // The priority (relative importance) of this content in the overall cache.
  // Generally, a lower value means a longer retention time or other advantage,
  // but the interpretation of a given value is server-dependent. A priority of
  // 0 means a *default* value, decided by the server.
  //
  // The particular semantics of this field is up to the server. In particular,
  // every server will have their own supported range of priorities, and will
  // decide how these map into retention/eviction policy.
  priority: number;
}

// The action cache API is used to query whether a given action has already been
// performed and, if so, retrieve its result. Unlike the
// [ContentAddressableStorage][build.bazel.remote.execution.v2.ContentAddressableStorage],
// which addresses blobs by their own content, the action cache addresses the
// [ActionResult][build.bazel.remote.execution.v2.ActionResult] by a
// digest of the encoded [Action][build.bazel.remote.execution.v2.Action]
// which produced them.
//
// The lifetime of entries in the action cache is implementation-specific, but
// the server SHOULD assume that more recently used entries are more likely to
// be used again.
//
// As with other services in the Remote Execution API, any call may return an
// error with a [RetryInfo][google.rpc.RetryInfo] error detail providing
// information about when the client should retry the request; clients SHOULD
// respect the information provided.
export interface ActionCache {
  // Retrieve a cached execution result.
  //
  // Implementations SHOULD ensure that any blobs referenced from the
  // [ContentAddressableStorage][build.bazel.remote.execution.v2.ContentAddressableStorage]
  // are available at the time of returning the
  // [ActionResult][build.bazel.remote.execution.v2.ActionResult] and will be
  // for some period of time afterwards. The TTLs of the referenced blobs SHOULD be increased
  // if necessary and applicable.
  //
  // Errors:
  //
  // * `NOT_FOUND`: The requested `ActionResult` is not in the cache.
  getActionResult(request: GetActionResultRequest): ActionResult;

  // Upload a new execution result.
  //
  // In order to allow the server to perform access control based on the type of
  // action, and to assist with client debugging, the client MUST first upload
  // the [Action][build.bazel.remote.execution.v2.Execution] that produced the
  // result, along with its
  // [Command][build.bazel.remote.execution.v2.Command], into the
  // `ContentAddressableStorage`.
  //
  // Errors:
  //
  // * `INVALID_ARGUMENT`: One or more arguments are invalid.
  // * `FAILED_PRECONDITION`: One or more errors occurred in updating the
  //   action result, such as a missing command or action.
  // * `RESOURCE_EXHAUSTED`: There is insufficient storage space to add the
  //   entry to the cache.
  updateActionResult(request: UpdateActionResultRequest): ActionResult;
}


// A content digest. A digest for a given blob consists of the size of the blob
// and its hash. The hash algorithm to use is defined by the server.
//
// The size is considered to be an integral part of the digest and cannot be
// separated. That is, even if the `hash` field is correctly specified but
// `size_bytes` is not, the server MUST reject the request.
//
// The reason for including the size in the digest is as follows: in a great
// many cases, the server needs to know the size of the blob it is about to work
// with prior to starting an operation with it, such as flattening Merkle tree
// structures or streaming it to a worker. Technically, the server could
// implement a separate metadata store, but this results in a significantly more
// complicated implementation as opposed to having the client specify the size
// up-front (or storing the size along with the digest in every message where
// digests are embedded). This does mean that the API leaks some implementation
// details of (what we consider to be) a reasonable server implementation, but
// we consider this to be a worthwhile tradeoff.
//
// When a `Digest` is used to refer to a proto message, it always refers to the
// message in binary encoded form. To ensure consistent hashing, clients and
// servers MUST ensure that they serialize messages according to the following
// rules, even if there are alternate valid encodings for the same message:
//
// * Fields are serialized in tag order.
// * There are no unknown fields.
// * There are no duplicate fields.
// * Fields are serialized according to the default semantics for their type.
//
// Most protocol buffer implementations will always follow these rules when
// serializing, but care should be taken to avoid shortcuts. For instance,
// concatenating two messages to merge them may produce duplicate fields.
export interface Digest {
  // The hash. In the case of SHA-256, it will always be a lowercase hex string
  // exactly 64 characters long.
  hash: string

  // The size of the blob, in bytes.
  size_bytes: number
}

// A request message for
// [ContentAddressableStorage.FindMissingBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.FindMissingBlobs].
export interface FindMissingBlobsRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string

  // A list of the blobs to check.
  blobDigests: Digest[]
}

// A response message for
// [ContentAddressableStorage.FindMissingBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.FindMissingBlobs].
export interface FindMissingBlobsResponse {
  // A list of the blobs requested *not* present in the storage.
  missingBlobDigests: Digest[]
}

// A request corresponding to a single blob that the client wants to upload.
export interface BatchUpdateBlobsRequest$Request {
  // The digest of the blob. This MUST be the digest of `data`.
  digest: Digest;

  // The raw binary data.
  data: Buffer;
}

// A request message for
// [ContentAddressableStorage.BatchUpdateBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.BatchUpdateBlobs].
export interface BatchUpdateBlobsRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string;

  // The individual upload requests.
  request: BatchUpdateBlobsRequest$Request[];
}

// A response corresponding to a single blob that the client tried to upload.
export interface BatchUpdateBlobsResponse$Response {
  // The blob digest to which this response corresponds.
  digest: Digest;

  // The result of attempting to upload that blob.
  status: RpcStatus;
}

// A response message for
// [ContentAddressableStorage.BatchUpdateBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.BatchUpdateBlobs].
export interface BatchUpdateBlobsResponse {
  // The responses to the requests.
  responses: BatchUpdateBlobsResponse$Response[];
}

// A request message for
// [ContentAddressableStorage.BatchReadBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.BatchReadBlobs].
export interface BatchReadBlobsRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string;

  // The individual blob digests.
  digests: Digest[];
}

// A response corresponding to a single blob that the client tried to download.
export interface BatchReadBlobsResponse$Response {
  // The digest to which this response corresponds.
  digest: Digest;

  // The raw binary data.
  data: Uint8Array;

  // The result of attempting to download that blob.
  status: RpcStatus;
}

// A response message for
// [ContentAddressableStorage.BatchReadBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.BatchReadBlobs].
export interface BatchReadBlobsResponse {
  // The responses to the requests.
  responses: BatchReadBlobsResponse$Response[];
}

// A request message for
// [ContentAddressableStorage.GetTree][build.bazel.remote.execution.v2.ContentAddressableStorage.GetTree].
export interface GetTreeRequest {
  // The instance of the execution system to operate against. A server may
  // support multiple instances of the execution system (with their own workers,
  // storage, caches, etc.). The server MAY require use of this field to select
  // between them in an implementation-defined fashion, otherwise it can be
  // omitted.
  instanceName: string;

  // The digest of the root, which must be an encoded
  // [Directory][build.bazel.remote.execution.v2.Directory] message
  // stored in the
  // [ContentAddressableStorage][build.bazel.remote.execution.v2.ContentAddressableStorage].
  rootDigest: Digest;

  // A maximum page size to request. If present, the server will request no more
  // than this many items. Regardless of whether a page size is specified, the
  // server may place its own limit on the number of items to be returned and
  // require the client to retrieve more items using a subsequent request.
  pageSize: number;

  // A page token, which must be a value received in a previous
  // [GetTreeResponse][build.bazel.remote.execution.v2.GetTreeResponse].
  // If present, the server will use that token as an offset, returning only
  // that page and the ones that succeed it.
  pageToken: string;
}

// A `Directory` represents a directory node in a file tree, containing zero or
// more children [FileNodes][build.bazel.remote.execution.v2.FileNode],
// [DirectoryNodes][build.bazel.remote.execution.v2.DirectoryNode] and
// [SymlinkNodes][build.bazel.remote.execution.v2.SymlinkNode].
// Each `Node` contains its name in the directory, either the digest of its
// content (either a file blob or a `Directory` proto) or a symlink target, as
// well as possibly some metadata about the file or directory.
//
// In order to ensure that two equivalent directory trees hash to the same
// value, the following restrictions MUST be obeyed when constructing a
// a `Directory`:
//
// * Every child in the directory must have a path of exactly one segment.
//   Multiple levels of directory hierarchy may not be collapsed.
// * Each child in the directory must have a unique path segment (file name).
//   Note that while the API itself is case-sensitive, the environment where
//   the Action is executed may or may not be case-sensitive. That is, it is
//   legal to call the API with a Directory that has both "Foo" and "foo" as
//   children, but the Action may be rejected by the remote system upon
//   execution.
// * The files, directories and symlinks in the directory must each be sorted
//   in lexicographical order by path. The path strings must be sorted by code
//   point, equivalently, by UTF-8 bytes.
// * The [NodeProperties][build.bazel.remote.execution.v2.NodeProperty] of files,
//   directories, and symlinks must be sorted in lexicographical order by
//   property name.
//
// A `Directory` that obeys the restrictions is said to be in canonical form.
//
// As an example, the following could be used for a file named `bar` and a
// directory named `foo` with an executable file named `baz` (hashes shortened
// for readability):
//
// ```json
// // (Directory proto)
// {
//   files: [
//     {
//       name: "bar",
//       digest: {
//         hash: "4a73bc9d03...",
//         size: 65534
//       },
//       node_properties: [
//         {
//           "name": "MTime",
//           "value": "2017-01-15T01:30:15.01Z"
//         }
//       ]
//     }
//   ],
//   directories: [
//     {
//       name: "foo",
//       digest: {
//         hash: "4cf2eda940...",
//         size: 43
//       }
//     }
//   ]
// }
//
// // (Directory proto with hash "4cf2eda940..." and size 43)
// {
//   files: [
//     {
//       name: "baz",
//       digest: {
//         hash: "b2c941073e...",
//         size: 1294,
//       },
//       is_executable: true
//     }
//   ]
// }
// ```
export interface Directory {
  // The files in the directory.
  files: FileNode[];

  // The subdirectories in the directory.
  directories: DirectoryNode[];

  // The symlinks in the directory.
  symlinks: SymlinkNode[];

  // The node properties of the Directory.
  nodeProperties: NodeProperty[]
}

// A single property for [FileNodes][build.bazel.remote.execution.v2.FileNode],
// [DirectoryNodes][build.bazel.remote.execution.v2.DirectoryNode], and
// [SymlinkNodes][build.bazel.remote.execution.v2.SymlinkNode]. The server is
// responsible for specifying the property `name`s that it accepts. If
// permitted by the server, the same `name` may occur multiple times.
export interface NodeProperty {
  // The property name.
  name: string;

  // The property value.
  value: string;
}

// A `FileNode` represents a single file and associated metadata.
export interface FileNode {
  // The name of the file.
  name: string;

  // The digest of the file's content.
  digest: Digest;

  // reserved 3; // Reserved to ensure wire-compatibility with `OutputFile`.

  // True if file is executable, false otherwise.
  isExecutable: boolean;

  // The node properties of the FileNode.
  nodeProperties: NodeProperty[];
}

// A `DirectoryNode` represents a child of a
// [Directory][build.bazel.remote.execution.v2.Directory] which is itself
// a `Directory` and its associated metadata.
export interface DirectoryNode {
  // The name of the directory.
  name: string;

  // The digest of the
  // [Directory][build.bazel.remote.execution.v2.Directory] object
  // represented. See [Digest][build.bazel.remote.execution.v2.Digest]
  // for information about how to take the digest of a proto message.
  digest: Digest;
}

// A `SymlinkNode` represents a symbolic link.
export interface SymlinkNode {
  // The name of the symlink.
  name: string;

  // The target path of the symlink. The path separator is a forward slash `/`.
  // The target path can be relative to the parent directory of the symlink or
  // it can be an absolute path starting with `/`. Support for absolute paths
  // can be checked using the [Capabilities][build.bazel.remote.execution.v2.Capabilities]
  // API. The canonical form forbids the substrings `/./` and `//` in the target
  // path. `..` components are allowed anywhere in the target path.
  target: string;

  // The node properties of the SymlinkNode.
  nodeProperties: NodeProperty[];
}

// A response message for
// [ContentAddressableStorage.GetTree][build.bazel.remote.execution.v2.ContentAddressableStorage.GetTree].
export interface GetTreeResponse {
  // The directories descended from the requested root.
  directories: Directory[];

  // If present, signifies that there are more results which the client can
  // retrieve by passing this as the page_token in a subsequent
  // [request][build.bazel.remote.execution.v2.GetTreeRequest].
  // If empty, signifies that this is the last page of results.
  nextPageToken: string;
}

// The CAS (content-addressable storage) is used to store the inputs to and
// outputs from the execution service. Each piece of content is addressed by the
// digest of its binary data.
//
// Most of the binary data stored in the CAS is opaque to the execution engine,
// and is only used as a communication medium. In order to build an
// [Action][build.bazel.remote.execution.v2.Action],
// however, the client will need to also upload the
// [Command][build.bazel.remote.execution.v2.Command] and input root
// [Directory][build.bazel.remote.execution.v2.Directory] for the Action.
// The Command and Directory messages must be marshalled to wire format and then
// uploaded under the hash as with any other piece of content. In practice, the
// input root directory is likely to refer to other Directories in its
// hierarchy, which must also each be uploaded on their own.
//
// For small file uploads the client should group them together and call
// [BatchUpdateBlobs][build.bazel.remote.execution.v2.ContentAddressableStorage.BatchUpdateBlobs].
// For large uploads, the client must use the
// [Write method][google.bytestream.ByteStream.Write] of the ByteStream API. The
// `resource_name` is `{instance_name}/uploads/{uuid}/blobs/{hash}/{size}`,
// where `instance_name` is as described in the next paragraph, `uuid` is a
// version 4 UUID generated by the client, and `hash` and `size` are the
// [Digest][build.bazel.remote.execution.v2.Digest] of the blob. The
// `uuid` is used only to avoid collisions when multiple clients try to upload
// the same file (or the same client tries to upload the file multiple times at
// once on different threads), so the client MAY reuse the `uuid` for uploading
// different blobs. The `resource_name` may optionally have a trailing filename
// (or other metadata) for a client to use if it is storing URLs, as in
// `{instance}/uploads/{uuid}/blobs/{hash}/{size}/foo/bar/baz.cc`. Anything
// after the `size` is ignored.
//
// A single server MAY support multiple instances of the execution system, each
// with their own workers, storage, cache, etc. The exact relationship between
// instances is up to the server. If the server does, then the `instance_name`
// is an identifier, possibly containing multiple path segments, used to
// distinguish between the various instances on the server, in a manner defined
// by the server. For servers which do not support multiple instances, then the
// `instance_name` is the empty path and the leading slash is omitted, so that
// the `resource_name` becomes `uploads/{uuid}/blobs/{hash}/{size}`.
// To simplify parsing, a path segment cannot equal any of the following
// keywords: `blobs`, `uploads`, `actions`, `actionResults`, `operations` and
// `capabilities`.
//
// When attempting an upload, if another client has already completed the upload
// (which may occur in the middle of a single upload if another client uploads
// the same blob concurrently), the request will terminate immediately with
// a response whose `committed_size` is the full size of the uploaded file
// (regardless of how much data was transmitted by the client). If the client
// completes the upload but the
// [Digest][build.bazel.remote.execution.v2.Digest] does not match, an
// `INVALID_ARGUMENT` error will be returned. In either case, the client should
// not attempt to retry the upload.
//
// For downloading blobs, the client must use the
// [Read method][google.bytestream.ByteStream.Read] of the ByteStream API, with
// a `resource_name` of `"{instance_name}/blobs/{hash}/{size}"`, where
// `instance_name` is the instance name (see above), and `hash` and `size` are
// the [Digest][build.bazel.remote.execution.v2.Digest] of the blob.
//
// The lifetime of entries in the CAS is implementation specific, but it SHOULD
// be long enough to allow for newly-added and recently looked-up entries to be
// used in subsequent calls (e.g. to
// [Execute][build.bazel.remote.execution.v2.Execution.Execute]).
//
// As with other services in the Remote Execution API, any call may return an
// error with a [RetryInfo][google.rpc.RetryInfo] error detail providing
// information about when the client should retry the request; clients SHOULD
// respect the information provided.
export interface ContentAddressableStorage {
  // Determine if blobs are present in the CAS.
  //
  // Clients can use this API before uploading blobs to determine which ones are
  // already present in the CAS and do not need to be uploaded again.
  //
  // There are no method-specific errors.
  findMissingBlobs(request: FindMissingBlobsRequest): FindMissingBlobsResponse;

  // Upload many blobs at once.
  //
  // The server may enforce a limit of the combined total size of blobs
  // to be uploaded using this API. This limit may be obtained using the
  // [Capabilities][build.bazel.remote.execution.v2.Capabilities] API.
  // Requests exceeding the limit should either be split into smaller
  // chunks or uploaded using the
  // [ByteStream API][google.bytestream.ByteStream], as appropriate.
  //
  // This request is equivalent to calling a Bytestream `Write` request
  // on each individual blob, in parallel. The requests may succeed or fail
  // independently.
  //
  // Errors:
  //
  // * `INVALID_ARGUMENT`: The client attempted to upload more than the
  //   server supported limit.
  //
  // Individual requests may return the following errors, additionally:
  //
  // * `RESOURCE_EXHAUSTED`: There is insufficient disk quota to store the blob.
  // * `INVALID_ARGUMENT`: The
  // [Digest][build.bazel.remote.execution.v2.Digest] does not match the
  // provided data.
  batchUpdateBlobs(request: BatchUpdateBlobsRequest): BatchUpdateBlobsResponse;

  // Download many blobs at once.
  //
  // The server may enforce a limit of the combined total size of blobs
  // to be downloaded using this API. This limit may be obtained using the
  // [Capabilities][build.bazel.remote.execution.v2.Capabilities] API.
  // Requests exceeding the limit should either be split into smaller
  // chunks or downloaded using the
  // [ByteStream API][google.bytestream.ByteStream], as appropriate.
  //
  // This request is equivalent to calling a Bytestream `Read` request
  // on each individual blob, in parallel. The requests may succeed or fail
  // independently.
  //
  // Errors:
  //
  // * `INVALID_ARGUMENT`: The client attempted to read more than the
  //   server supported limit.
  //
  // Every error on individual read will be returned in the corresponding digest
  // status.
  batchReadBlobs(request: BatchReadBlobsRequest): BatchReadBlobsResponse;

  // Fetch the entire directory tree rooted at a node.
  //
  // This request must be targeted at a
  // [Directory][build.bazel.remote.execution.v2.Directory] stored in the
  // [ContentAddressableStorage][build.bazel.remote.execution.v2.ContentAddressableStorage]
  // (CAS). The server will enumerate the `Directory` tree recursively and
  // return every node descended from the root.
  //
  // The GetTreeRequest.page_token parameter can be used to skip ahead in
  // the stream (e.g. when retrying a partially completed and aborted request),
  // by setting it to a value taken from GetTreeResponse.next_page_token of the
  // last successfully processed GetTreeResponse).
  //
  // The exact traversal order is unspecified and, unless retrieving subsequent
  // pages from an earlier request, is not guaranteed to be stable across
  // multiple invocations of `GetTree`.
  //
  // If part of the tree is missing from the CAS, the server will return the
  // portion present and omit the rest.
  //
  // Errors:
  //
  // * `NOT_FOUND`: The requested tree root is not present in the CAS.
  getTree(request: GetTreeRequest): Observable<GetTreeResponse>
}
