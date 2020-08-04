import { Injectable } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';
import { debounceTime, map, shareReplay, startWith } from 'rxjs/operators';

import { InvocationHandler } from './invocation-handler';
import { InvocationAttemptFinished, InvocationAttemptStarted, StreamId } from '../../../types/messages/build-events';
import { BuildEvent } from '../../../types/messages/build-event-steam';
import { Result } from '../../../types/messages/build-status';
import { InvocationStates } from '../../../types/events';

@Injectable()
export class InvocationSummaryHandlerService implements InvocationHandler {
  private static readonly INVOCATION_STALE_MINS = 30;

  private readonly invocations: InvocationStates = {};
  private readonly finishedInvocations: Set<string> = new Set();

  private readonly invocationsChanged$ = new Subject<void>();
  private readonly invocations$: Observable<Readonly<InvocationStates>>;

  constructor() {
    setInterval(() => {
      if (!this.finishedInvocations.size) { return; }

      const threshold = new Date(
        new Date().getTime() - 1000 * 60 * InvocationSummaryHandlerService.INVOCATION_STALE_MINS).getTime();

      let hasChanged = false;
      this.finishedInvocations.forEach(invocation => {
        const state = this.invocations[invocation];
        if (state.finished <= threshold) {
          delete this.invocations[invocation];
          this.finishedInvocations.delete(invocation);
          hasChanged = true;
        }
      });

      if (hasChanged) {
        this.notifyInvocationsChanged();
      }
    }, 1000 * 60 * InvocationSummaryHandlerService.INVOCATION_STALE_MINS);

    this.invocations$ = this.invocationsChanged$
      .pipe(
        debounceTime(100),
        startWith(this.invocations),
        map(() => ({ ...this.invocations })),
        shareReplay({ bufferSize: 1, refCount: false })
      );
  }

  handleBuildEvent(streamId: StreamId, event: BuildEvent, sequenceNumber: number, notificationKeywords: string[]): void {
    const data = this.invocations[streamId.invocationId];
    if (!data) { return; }

    if (event.id.started) {
      data.started = event.started.startTimeMillis.toNumber();
      data.keywords = this.parseUserNotificationKeywords(notificationKeywords);

      this.notifyInvocationsChanged();
    } else if (event.id.buildFinished) {
      data.finished = event.finished.finishTimeMillis.toNumber();
      this.notifyInvocationsChanged();
    }
  }

  notifyInvocationStarted(streamId: StreamId, event: InvocationAttemptStarted): void {
    this.invocations[streamId.invocationId] = {
      state: 'RUNNING',
      started: new Date().getTime()
    };

    this.notifyInvocationsChanged();
  }

  notifyInvocationFinished(streamId: StreamId, event: InvocationAttemptFinished): void {
    const invocationId = streamId.invocationId;
    if (!this.invocations.hasOwnProperty(invocationId)) {
      return;
    }

    const data = this.invocations[invocationId];
    data.state = Result[event.invocationStatus.result];
    data.finished = new Date().getTime();

    this.finishedInvocations.add(invocationId);

    this.notifyInvocationsChanged();
  }

  getTrackedInvocations$(): Observable<Readonly<InvocationStates>> {
    return this.invocations$;
  }

  private notifyInvocationsChanged(): void {
    this.invocationsChanged$.next();
  }

  private parseUserNotificationKeywords(keywords: string[]): { [key: string]: string } {
    if (!keywords) { return {}; }

    return keywords.reduce(((previousValue, currentValue) => {
      // user keywords from --bes_keywords have user_keyword appended, eg
      // user_keyword=foo=bar
      const parts = currentValue.split('=');
      if (parts.length === 3) {
        previousValue[parts[1]] = parts[2];
      }

      return previousValue;
    }), {});
  }
}
