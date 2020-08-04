import { WriteStream } from 'fs';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { bufferTime, filter, map } from 'rxjs/operators';
import { Observable, partition, Subject } from 'rxjs';

import { BuildEventsPersistenceProvider } from './build-events-persistence.provider';
import { Invocation, InvocationRef } from '../../types/invocation-ref';
import { EventType } from '../../types/events';
import { StreamId } from '../../types/messages/build-events';
import { BuildEvent } from '../../types/messages/build-event-steam';
import { ActionResult } from '../../types/messages/remote-execution';
import { CachePersistenceProvider } from './cache-persistence.provider';

export const DEFAULT_BUILD_EVENTS_PERSISTENCE_PROVIDER = Symbol.for('DEFAULT_BE_PERSISTENCE_PROVIDER');
export const DEFAULT_CACHE_PERSISTENCE_PROVIDER = Symbol.for('DEFAULT_CACHE_PERSISTENCE_PROVIDER');

class CountdownLatch {
  private _latch$: Subject<number> = new Subject<number>();

  constructor(private count) {}

  get latch$(): Observable<number> {
    return this._latch$.asObservable();
  }

  countdown(amount = 1) {
    if (this._latch$.isStopped) {
      throw new Error(`Latch already at 0`);
    }

    this.count -= amount;
    if (this.count > 0) {
      this._latch$.next(this.count);
    } else {
      this._latch$.complete();
    }
  }
}

@Injectable()
export class PersistenceService {
  private readonly logger: Logger = new Logger(PersistenceService.name);

  constructor(
    @Inject(DEFAULT_BUILD_EVENTS_PERSISTENCE_PROVIDER)
    private readonly persistenceProvider: BuildEventsPersistenceProvider,
    @Inject(DEFAULT_CACHE_PERSISTENCE_PROVIDER)
    private readonly cachePersistenceProvider: CachePersistenceProvider
  ) {}

  startPersistenceSessionForInvocation(invocation: Invocation, buildEvent$: Observable<BuildEvent>) {
    this.logger.log(`Starting persistence session for invocation '${invocation.ref.streamId.invocationId}'`);

    this.persistenceProvider.startSession(invocation.ref.streamId);

    const [progress$, changes$] = partition(invocation.changes$, data => data.event === EventType.PROGRESS_EVENT);
    const allReportComplete = new CountdownLatch(3);

    allReportComplete
      .latch$
      .subscribe({
        complete: () => {
          process.nextTick(() => {
            this.logger.log(`Invocation '${invocation.ref.streamId.invocationId}' marked complete, closing persistence session`);
            this.persistenceProvider.endSession(invocation.ref.streamId);
          });
        }
      });

    progress$
      .pipe(
        bufferTime(200, undefined, 50),
        filter(events => !!events.length),
        map(events => [...events.map(event => event.data.payload)])
      )
      .subscribe({
        next: (log: string[]) =>
          process.nextTick(() => this.persistenceProvider.persistProgress(invocation.ref.streamId, log)),
        complete: () => allReportComplete.countdown()
      });

    changes$
      .pipe(
        bufferTime(200, undefined, 50),
        filter(events => !!events.length),
        map(events => events[events.length - 1])
      )
      .subscribe({
        next: value =>
          process.nextTick(() => this.persistenceProvider.persistInvocationRef(invocation.ref.streamId, invocation.ref)),
        complete: () => allReportComplete.countdown()
      });

    buildEvent$
      .pipe(
        bufferTime(500, undefined, 100),
        filter(events => !!events.length)
      )
      .subscribe({
        next: (events: BuildEvent[]) =>
          process.nextTick(() => this.persistenceProvider.persistBuildEvents(invocation.ref.streamId, events)),
        complete: () => allReportComplete.countdown()
      });
  }

  persistActionResult(key: string, actionResult: ActionResult) {
    process.nextTick(() => this.cachePersistenceProvider.persistActionResult(key, actionResult));
  }

  fetchActionResult(key: string): ActionResult {
    return this.cachePersistenceProvider.fetchActionResult(key);
  }

  persistBuildArtifact(key: string, data?: Buffer): WriteStream {
    return this.cachePersistenceProvider.persistBuildArtifact(key, data);
  }

  hasBuildArtifact(key: string): boolean {
    return this.cachePersistenceProvider.hasBuildArtifact(key);
  }

  fetchBuildArtifact(key: string): Buffer | undefined {
    return this.cachePersistenceProvider.fetchBuildArtifact(key);
  }

  fetchInvocationRef(streamId: StreamId): InvocationRef {
    return this.persistenceProvider.fetchInvocation(streamId);
  }
}
