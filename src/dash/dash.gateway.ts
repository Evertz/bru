import { Injectable } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { EMPTY, from, Observable, concat } from 'rxjs';
import {
  debounceTime,
  map,
  switchMap,
  startWith,
  bufferTime,
} from 'rxjs/operators';
import { chunk } from 'lodash';

import { DefaultInvocationHandler } from '../bes/handlers/default-invocation-handler.service';
import { Target } from '../../types/invocation-ref';
import { BesEventFactory, EventType } from '../../types/events';

@Injectable()
@WebSocketGateway({ namespace: 'events' })
export class DashGateway {
  private static readonly UPDATE_INTERVAL = 1000;

  constructor(private readonly handler: DefaultInvocationHandler) {}

  @SubscribeMessage('subscribe/targets')
  onSubscribeToTargets(@MessageBody() data: { invocationId: string }): Observable<WsResponse> {
    const invocation = this.handler.queryFor(data.invocationId);

    if (!invocation) {
      return EMPTY;
    }

    return invocation.targets$.pipe(
        startWith(invocation.ref.targets),
        // the changes can be, spammy, add a little rate limiting relief for the client
        bufferTime(DashGateway.UPDATE_INTERVAL),
        // with large target sets, chunk them into multiple messages to avoid overloading the pipe with one
        // message, this _may_ result in spammy messages again (for large arrays when the breaking into chunks results
        // in large amount of messages)
        switchMap(targets => from(targets)),
        map(targets => Object.values(targets)),
        switchMap(targets => from(chunk(targets, 1000))),
        map((targets: Target[]) => targets.reduce((previousValue, currentValue) => {
          previousValue[currentValue.label] = currentValue;
          return previousValue;
        }, {})),
        map(targets => BesEventFactory(EventType.TARGETS_EVENT, data.invocationId, targets))
    );
  }

  @SubscribeMessage('subscribe/details')
  onSubscribeToInvocationDetails(@MessageBody() data: { invocationId: string }): Observable<WsResponse> {
    const invocation = this.handler.queryFor(data.invocationId);

    if (!invocation) {
      return EMPTY;
    }

    return invocation.details$
      .pipe(
        debounceTime(DashGateway.UPDATE_INTERVAL),
        startWith(invocation.ref.invocationDetails),
        map(invocationDetails => BesEventFactory(EventType.INVOCATION_DETAILS_EVENT, data.invocationId, invocationDetails))
      );
  }

  @SubscribeMessage('subscribe/progress')
  onSubscribeToProgress(@MessageBody() data: { invocationId: string }): Observable<WsResponse> {
    const invocation = this.handler.queryFor(data.invocationId);

    if (!invocation) {
      return EMPTY;
    }

    return concat(from(invocation.ref.progress), invocation.progress$)
      .pipe(map(progress => BesEventFactory(EventType.PROGRESS_EVENT, data.invocationId, progress)));
  }

  @SubscribeMessage('subscribe/fetched')
  onSubscribeToFetched(@MessageBody() data: { invocationId: string }): Observable<WsResponse> {
    const invocation = this.handler.queryFor(data.invocationId);

    if (!invocation) {
      return EMPTY;
    }

    return concat(from(invocation.ref.fetched), invocation.fetched$)
      .pipe(map(fetched => BesEventFactory(EventType.FETCHED_EVENT, data.invocationId, fetched)));
  }
}
