import { Any } from './any';

export enum Result {
  // Unspecified or unknown.
  UNKNOWN_STATUS = 0,

  // Build was successful and tests (if requested) all pass.
  COMMAND_SUCCEEDED = 1,
  
  // Build error and/or test failure.
  COMMAND_FAILED = 2,
  
  // Unable to obtain a result due to input provided by the user.
  USER_ERROR = 3,
  
  // Unable to obtain a result due to a failure within the build system.
  SYSTEM_ERROR = 4,
  
  // Build required too many resources, such as build tool RAM.
  RESOURCE_EXHAUSTED = 5,
  
  // An invocation attempt time exceeded its deadline.
  INVOCATION_DEADLINE_EXCEEDED = 6,
  
  // Build request time exceeded the request_deadline
  REQUEST_DEADLINE_EXCEEDED = 8,
  
  // The build was cancelled by a call to CancelBuild.
  CANCELLED = 7
}

// Status used for both invocation attempt and overall build completion.
export interface BuildStatus {
  // The end result.
  result: Result;

  // Fine-grained diagnostic information to complement the status.
  details?: Any;
}