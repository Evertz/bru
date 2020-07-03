import { Inject, Injectable, Logger } from '@nestjs/common';

import { bufferTime, filter, map } from 'rxjs/operators';

import { PersistenceProvider } from './persistence.provider';
import { Invocation, InvocationRef } from '../../types/invocation-ref';
import { EventType } from '../../types/events';
import { Observable, partition, Subject } from 'rxjs';
import { StreamId } from '../../types/messages/build-events';
import { BuildEvent } from '../../types/messages/build-event-steam';

export const DEFAULT_PERSISTENCE_PROVIDER = Symbol.for('DEFAULT_PERSISTENCE_PROVIDER');

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
    @Inject(DEFAULT_PERSISTENCE_PROVIDER) private readonly persistenceProvider: PersistenceProvider
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
            this.persistenceProvider.endSession(invocation.ref.streamId);
            this.logger.log(`Invocation '${invocation.ref.streamId.invocationId}' marked complete, closing persistence session`);
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

  fetchInvocationRef(streamId: StreamId): InvocationRef {
    return this.persistenceProvider.fetchInvocation(streamId);
  }
}
