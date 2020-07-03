import { Injectable } from '@nestjs/common';

import { PersistenceProvider } from '../persistence.provider';
import { StreamId } from '../../../types/messages/build-events';
import { BuildEvent } from '../../../types/messages/build-event-steam';
import { InvocationRef } from '../../../types/invocation-ref';

/**
 * A persistence provider where all requests to persist and fetch are ignored, useful for testing
 */
@Injectable()
export class NoopPersistenceProvider extends PersistenceProvider {
  fetchBuildEvents(streamId: StreamId): BuildEvent[] { return []; }

  fetchInvocation(streamId: StreamId): InvocationRef { return undefined; }

  persistBuildEvents(streamId: StreamId, events: BuildEvent[]) {}

  persistInvocationRef(streamId: StreamId, ref: InvocationRef) {}

  persistProgress(streamId: StreamId, log: string[]) {}
}
