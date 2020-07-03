import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';


import { BepHandler, RegisteredHandlers } from './handlers/bep-handler';
import { BuildEventStreamProtoRoot } from './build-event-stream-proto-root';
import {
  PublishBuildEvent,
  PublishBuildToolEventStreamRequest, PublishBuildToolEventStreamResponse,
  PublishLifecycleEventRequest
} from '../../types/messages/publish-build-event';
import { StreamId } from '../../types/messages/build-events';
import { BuildEvent } from '../../types/messages/build-event-steam';

@Controller()
export class BesController implements PublishBuildEvent {
  constructor(private readonly eventStreamProtoRoot: BuildEventStreamProtoRoot,
              @Inject(RegisteredHandlers) private readonly proxies: BepHandler[]) {}

  @GrpcMethod('PublishBuildEvent', 'PublishLifecycleEvent')
  publishLifecycleEvent(data: PublishLifecycleEventRequest) {
    if (data.buildEvent.event.invocationAttemptStarted) {
      this.notifyHandlers(
        'notifyInvocationStarted',
        [data.buildEvent.streamId, data.buildEvent.event.invocationAttemptStarted]
      );
    } else if (data.buildEvent.event.invocationAttemptFinished) {
      this.notifyHandlers('notifyInvocationFinished',
        [data.buildEvent.streamId, data.buildEvent.event.invocationAttemptFinished]
      );
    }

    // we don't care about the other events
    // NOTE(mmackay): in ev, CI will publish build queue events which are handled here

    return {};
  }

  @GrpcStreamMethod('PublishBuildEvent', 'PublishBuildToolEventStream')
  publishBuildToolEventStream(data$: Observable<PublishBuildToolEventStreamRequest>): Observable<PublishBuildToolEventStreamResponse> {
    const resp$ = new Subject<PublishBuildToolEventStreamResponse>();

    const acks: number[] = [];
    let streamId: StreamId;

    data$.subscribe(publishRequest => {
      if (!streamId && publishRequest.orderedBuildEvent?.streamId) {
        streamId = publishRequest.orderedBuildEvent.streamId;
      }

      const sequenceNumber = publishRequest.orderedBuildEvent.sequenceNumber.toNumber();
      acks.push(sequenceNumber);

      if (publishRequest.orderedBuildEvent.event.hasOwnProperty('bazelEvent')) {
        const anyBazelEvent = publishRequest.orderedBuildEvent.event.bazelEvent;

        const BazelBuildEvent = this.eventStreamProtoRoot.lookupType('BuildEvent');
        const bazelEvent = BazelBuildEvent.decode(anyBazelEvent.value) as unknown as BuildEvent;

        this.notifyHandlers('handleBuildEvent', [streamId, bazelEvent, sequenceNumber]);
      }

    }, err => {
      console.error(err);
    }, () => {
      acks
        .sort((a, b) => a - b)
        .forEach(sequenceNumber => {
          resp$.next({
            sequenceNumber,
            streamId
          });
        });

      resp$.complete();
    });

    return resp$.asObservable();
  }

  private notifyHandlers(method: string, args: any[]) {
    // notify proxies on the next VM turn, so as to not block handling
    // from each proxy
    process.nextTick(() => {
      this.proxies.forEach(proxy => {
        (proxy[method] as Function).apply(proxy, args);
      });
    });
  }
}
