import { Logger } from '@nestjs/common';

import { ReplaySubject } from 'rxjs';

import { BepHandler } from './bep-handler';
import { DefaultBuildEventHandler } from './build-event-handler';
import { Invocation } from '../../../types/invocation-ref';
import { InvocationAttemptFinished, InvocationAttemptStarted, StreamId } from '../../../types/messages/build-events';
import { BuildEvent } from '../../../types/messages/build-event-steam';

export class DefaultBepHandler implements BepHandler {
  private readonly logger = new Logger(DefaultBepHandler.name);

  // invocationId -> InvocationRef
  private readonly data: Map<string, Invocation> = new Map();
  private readonly notifiers: Map<string, ReplaySubject<Invocation>> = new Map();

  private buildEventHandler = new DefaultBuildEventHandler(true);

  notifyInvocationStarted(streamId: StreamId, event: InvocationAttemptStarted): void {
    this.logger.log(`Starting streaming ref '${streamId.invocationId}'`);

    this.data.set(
      streamId.invocationId,
      Invocation.init(streamId.invocationId)
    );

    this.notifiers.set(
      streamId.invocationId,
      new ReplaySubject<Invocation>(1)
    );
  }

  notifyInvocationFinished(streamId: StreamId, event: InvocationAttemptFinished): void {
    if (!this.data.has(streamId.invocationId)) { return; }

    this.data.get(streamId.invocationId).dispose();
    this.notifiers.get(streamId.invocationId).complete();
    this.notifiers.delete(streamId.invocationId);

    this.logger.log(`Disposed of streaming ref '${streamId.invocationId}'`);
  }

  handleBuildEvent(streamId: StreamId, event: BuildEvent): void {
    const invocation = this.data.get(streamId.invocationId);
    if (!invocation) { return; }

    let hasChangedInvocation = false;

    if (event.id.fetch) { hasChangedInvocation = this.buildEventHandler.handleFetch(invocation, streamId, event); }
    if (event.id.started) { hasChangedInvocation = this.buildEventHandler.handleStarted(invocation, streamId, event); }
    if (event.id.buildFinished) { hasChangedInvocation = this.buildEventHandler.handleBuildFinished(invocation, streamId, event); }
    if (event.id.targetConfigured) { hasChangedInvocation = this.buildEventHandler.handleTargetConfigured(invocation, streamId, event) }
    if (event.id.targetCompleted) { hasChangedInvocation = this.buildEventHandler.handleTargetCompleted(invocation, streamId, event); }
    if (event.id.actionComplete) { hasChangedInvocation = this.buildEventHandler.handleActionComplete(invocation, streamId, event); }
    if (event.id.testResult) { hasChangedInvocation = this.buildEventHandler.handleTestResult(invocation, streamId, event); }
    if (event.id.buildMetadata) { hasChangedInvocation = this.buildEventHandler.handleBuildMetadata(invocation, streamId, event); }
    if (event.id.buildMetrics) { hasChangedInvocation = this.buildEventHandler.handleBuildMetrics(invocation, streamId, event); }
    if (event.id.pattern) { hasChangedInvocation = this.buildEventHandler.handlePattern(invocation, streamId, event); }
    if (event.id.progress) { hasChangedInvocation = this.buildEventHandler.handleProgress(invocation, streamId, event); }
    if (event.id.configuration) { hasChangedInvocation = this.buildEventHandler.handleConfiguration(invocation, streamId, event); }
    if (event.id.workspaceStatus) { hasChangedInvocation = this.buildEventHandler.handleWorkspaceStatus(invocation, streamId, event); }
    if (event.id.structuredCommandLine) { hasChangedInvocation = this.buildEventHandler.handleStructuredCommandLine(invocation, streamId, event); }
    if (event.id.unstructuredCommandLine) { hasChangedInvocation = this.buildEventHandler.handleUnstructuredCommandLine(invocation, streamId, event); }

    // now the event has been handled, forward the ref to listeners
    if (hasChangedInvocation && this.notifiers.has(streamId.invocationId)) {
      this.notifiers.get(streamId.invocationId)
        .next(invocation);
    }
  }

  queryFor(invocationId: string): Invocation {
    return this.data.get(invocationId);
  }
}
