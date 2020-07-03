import { Injectable, Logger } from '@nestjs/common';

import { EMPTY, Observable, Subject } from 'rxjs';

import { InvocationHandler } from './invocation-handler';
import { DefaultBuildEventHandler } from './default-build-event-handler';
import { Invocation } from '../../../types/invocation-ref';
import { InvocationAttemptFinished, InvocationAttemptStarted, StreamId } from '../../../types/messages/build-events';
import { BuildEvent } from '../../../types/messages/build-event-steam';
import { PersistenceService } from '../../persistence/persistence.service';

@Injectable()
export class DefaultInvocationHandler implements InvocationHandler {
  private readonly logger = new Logger(DefaultInvocationHandler.name);

  // invocationId -> Invocation
  private readonly data: Map<string, Invocation> = new Map();
  // invocationId -> observable of bazel build events
  private readonly buildEventStreams: Map<string, Subject<BuildEvent>> = new Map();

  private buildEventHandler = new DefaultBuildEventHandler(true);

  constructor(private readonly persistenceService: PersistenceService) {
    setInterval(() => this.logProcessStats(), 1000 * 30);
  }

  notifyInvocationStarted(streamId: StreamId, event: InvocationAttemptStarted): void {
    this.logger.log(`Starting streaming ref '${streamId.invocationId}'`);
    this.logProcessStats();

    const invocation = Invocation.init(streamId.invocationId);

    this.data.set(streamId.invocationId, invocation);

    const buildEvent$ = new Subject<BuildEvent>();
    this.buildEventStreams.set(streamId.invocationId, buildEvent$);

    this.persistenceService.startPersistenceSessionForInvocation(invocation, buildEvent$.asObservable());
  }

  notifyInvocationFinished(streamId: StreamId, event: InvocationAttemptFinished): void {
    if (!this.data.has(streamId.invocationId)) { return; }

    this.data.get(streamId.invocationId).dispose();
    this.buildEventStreams.get(streamId.invocationId).complete();

    this.data.delete(streamId.invocationId);
    this.buildEventStreams.delete(streamId.invocationId);

    this.logger.log(`Disposed of streaming ref '${streamId.invocationId}'`);
    this.logProcessStats();
  }

  handleBuildEvent(streamId: StreamId, event: BuildEvent, sequenceNumber: number): void {
    const invocation = this.data.get(streamId.invocationId);
    if (!invocation) { return; }

    if (event.id.fetch) { this.buildEventHandler.handleFetch(invocation, streamId, event); }
    if (event.id.started) { this.buildEventHandler.handleStarted(invocation, streamId, event); }
    if (event.id.buildFinished) { this.buildEventHandler.handleBuildFinished(invocation, streamId, event); }
    if (event.id.targetConfigured) { this.buildEventHandler.handleTargetConfigured(invocation, streamId, event) }
    if (event.id.targetCompleted) { this.buildEventHandler.handleTargetCompleted(invocation, streamId, event); }
    if (event.id.actionComplete) { this.buildEventHandler.handleActionComplete(invocation, streamId, event); }
    if (event.id.testResult) { this.buildEventHandler.handleTestResult(invocation, streamId, event); }
    if (event.id.buildMetadata) { this.buildEventHandler.handleBuildMetadata(invocation, streamId, event); }
    if (event.id.buildMetrics) { this.buildEventHandler.handleBuildMetrics(invocation, streamId, event); }
    if (event.id.pattern) { this.buildEventHandler.handlePattern(invocation, streamId, event); }
    if (event.id.progress) { this.buildEventHandler.handleProgress(invocation, streamId, event); }
    if (event.id.configuration) { this.buildEventHandler.handleConfiguration(invocation, streamId, event); }
    if (event.id.workspaceStatus) { this.buildEventHandler.handleWorkspaceStatus(invocation, streamId, event); }
    if (event.id.structuredCommandLine) { this.buildEventHandler.handleStructuredCommandLine(invocation, streamId, event); }
    if (event.id.unstructuredCommandLine) { this.buildEventHandler.handleUnstructuredCommandLine(invocation, streamId, event); }

    if (this.buildEventStreams.has(streamId.invocationId)) {
      // now that it's been handled, forward to any proxies (eg, persistence layers)
      const stream = this.buildEventStreams.get(streamId.invocationId);
      if (!stream.closed) {
        this.buildEventStreams.get(streamId.invocationId).next(event);
      }
    }
  }

  queryFor(invocationId: string): Invocation {
    if (this.data.has(invocationId)) {
      return this.data.get(invocationId);
    } else {
      const ref = this.persistenceService.fetchInvocationRef({ invocationId });
      if (ref) {
        return Invocation.fromRef(ref);
      }
    }
  }

  registerForEvents(invocationId: string): Observable<BuildEvent> {
    if (this.buildEventStreams.has(invocationId)) {
      return this.buildEventStreams.get(invocationId).asObservable();
    }

    return EMPTY;
  }

  private logProcessStats() {
    const mem = process.memoryUsage();
    const proc = process.cpuUsage();
    this.logger.verbose(`Memory heap used: ${mem.heapUsed}, heap total ${mem.heapTotal}, rss ${mem.rss}, cpu userland: ${proc.user}`);
  }
}
