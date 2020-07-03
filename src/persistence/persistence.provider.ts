import { Logger } from '@nestjs/common';

import { BuildEvent } from '../../types/messages/build-event-steam';
import { StreamId } from '../../types/messages/build-events';
import { InvocationRef } from '../../types/invocation-ref';

export const PERSISTENCE_PROVIDER_CONFIG = Symbol.for('PersistenceProviderConfig');

/**
 * Provider class that provides an abstraction over the persistent storage used for invocation data
 * The caller should not have to handle storage implementations via this interface
 */
export abstract class PersistenceProvider {
  protected readonly logger: Logger = new Logger(PersistenceProvider.name);
  protected readonly sessions: Set<string> = new Set();

  /**
   * Starts a session with this provider and does any setup that the provider requires for an invocation
   */
  startSession(streamId: StreamId) {
    const id = streamId.invocationId;
    if (this.sessions.has(id)) {
      this.logger.warn(`An open persistence session already exists for invocation ${id}`);
    } else {
      this.sessions.add(id);
    }
  }

  /**
   * Ends a session with this provider, doing any cleanup the provider requires
   */
  endSession(streamId: StreamId) {
    const id = streamId.invocationId;
    if (!this.sessions.has(id)) {
      this.logger.warn(`No open persistence session for invocation ${id}`);
    } else {
      this.sessions.delete(id);
    }
  }

  /**
   * Persists a raw Build event to storage
   */
  abstract persistBuildEvents(streamId: StreamId, events: BuildEvent[]);

  /**
   * Persists the transient data on an invocation ref, however some providers may ignore progress
   * without an explict call to persistProgress
   */
  abstract persistInvocationRef(streamId: StreamId, ref: InvocationRef);

  /**
   * Persists (or, appends) the given progress log to storage
   */
  abstract persistProgress(streamId: StreamId, log: string[]);

  /**
   * Fetches the invocation from storage from the given invocationId
   */
  abstract fetchInvocation(streamId: StreamId): InvocationRef;

  /**
   * Fetches a list of raw build events (if available) from storage
   */
  abstract fetchBuildEvents(streamId: StreamId): BuildEvent[];

  protected checkSession(invocationId: string): boolean {
    if (!this.sessions.has(invocationId)) {
      this.logger.error(`No open persistence session for invocation ${invocationId}`);
      return false;
    }

    return true;
  }
}
