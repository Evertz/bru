import { Observable } from 'rxjs';

import { InvocationAttemptFinished, InvocationAttemptStarted, StreamId } from '../../../types/messages/build-events';
import { BuildEvent } from '../../../types/messages/build-event-steam';
import { Invocation } from '../../../types/invocation-ref';

export const RegisteredHandlers = Symbol.for('RegisteredHandlers');

/**
 * Interface for all invocation handlers, that is, a class that can handle events from the Build Event Protocol
 *
 * A handler may be responsible for keeping data cached in memory for querying, or for persisting data to a DB or other
 * storage, and generally acting as a proxy between the raw BuildEvent and the transform InvocationRef
 *
 * Handlers also act as data sources for those who need to query an invocation. The data returned may depend on the
 * underlying implementation of the handler (eg, a handler dealing with persistence may not return the latest data, if
 * new data is still streaming in)
 */
export interface InvocationHandler {
  /**
   * Notify the handler that an invocation has started
   */
  notifyInvocationStarted(streamId: StreamId, event: InvocationAttemptStarted): void;

  /**
   * Notify the handler that an invocation has finished
   * No more build events are expected after this has been called for a given invocation (handlers are free to
   * treat this as an error case, but it may just be ignored)
   */
  notifyInvocationFinished(streamId: StreamId, event: InvocationAttemptFinished): void;

  /**
   * Notify the handler of a particular build event
   *
   * If this event is part of an invocation not yet started, or one already finished, the event may be ignored and dropped,
   * or an error raised depending on the handler implementation
   */
  handleBuildEvent(streamId: StreamId, event: BuildEvent, sequenceNumber: number, notificationKeywords?: string[]): void;
}

/**
 * Interface for querying for data on invocations
 */
export interface InvocationQueryHandler {
  /**
   * Returns the 'latest' data (as known by this handler) about the given invocation
   */
  queryFor(invocationId: string): Invocation;

  /**
   * Registers for a stream of the raw build events for the given invocation that is in flight
   * For completed invocations, this returns a stopped observable
   */
  registerForEvents(invocationId: string): Observable<BuildEvent>;
}

/**
 * Interface for handling build events and transforming them to data on an InvocationRef
 * Generally build event handlers do not store any state, and just provide a common interface for data transformation
 */
export abstract class BuildEventHandler {
  /**
   * Handles the Started Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleStarted(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    return false;
  }

  /**
   * Handles the Progress Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleProgress(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    return false;
  }

  /**
   * Handles the Pattern Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handlePattern(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    return false;
  }

  /**
   * Handles the Build Finished Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleBuildFinished(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Target Configured Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleTargetConfigured(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Target Complete Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleTargetCompleted(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Action Complete Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleActionComplete(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Fetch Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleFetch(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Test Result Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleTestResult(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Test Summary Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleTestSummary(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Build Metrics Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleBuildMetrics(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Build Metadata Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleBuildMetadata(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Build Configuration Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleConfiguration(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Workspace status Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleWorkspaceStatus(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Structured command line Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleStructuredCommandLine(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }

  /**
   * Handles the Unstructured command line Build Event
   * @param invocation
   * @param streamId
   * @param event
   */
  handleUnstructuredCommandLine(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean  {
    return false;
  }
}
