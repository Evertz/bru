import * as fs from 'fs';
import * as path from 'path';

import { Inject, Injectable } from '@nestjs/common';

import { PersistenceProvider, PERSISTENCE_PROVIDER_CONFIG } from '../persistence.provider';
import { StreamId } from '../../../types/messages/build-events';
import { BuildEvent } from '../../../types/messages/build-event-steam';
import { InvocationRef } from '../../../types/invocation-ref';

export interface LocalFileProviderConfig {
  base: string;
}

@Injectable()
export class LocalFilePersistenceProvider extends PersistenceProvider {
  constructor(@Inject(PERSISTENCE_PROVIDER_CONFIG)
              private readonly config: LocalFileProviderConfig) {
    super();
  }

  startSession(streamId: StreamId) {
    super.startSession(streamId);

    const filePath = this.makePathFor(streamId.invocationId);
    fs.mkdirSync(filePath, { recursive: true });
  }

  persistBuildEvents(streamId: StreamId, events: BuildEvent[]) {
    if (!this.checkSession(streamId.invocationId)) { return; }

    const filePath = this.makePathFor(streamId.invocationId, 'raw.json');
    fs.appendFileSync(
      filePath,
      events.map(event => JSON.stringify(event)).join('\n'),
      { encoding: 'utf8' }
    );
  }

  persistInvocationRef(streamId: StreamId, ref: InvocationRef) {
    if (!this.checkSession(streamId.invocationId)) { return; }

    fs.writeFileSync(
      this.makePathFor(streamId.invocationId, 'ref.json'),
      JSON.stringify({ ...ref, progress: [] } as InvocationRef),
      { encoding: 'utf8' }
    );
  }

  persistProgress(streamId: StreamId, log: string[]) {
    if (!this.checkSession(streamId.invocationId)) { return; }

    fs.appendFileSync(
      this.makePathFor(streamId.invocationId, 'ref.log'),
      log.join(''),
      { encoding: 'utf8' }
    );
  }

  fetchBuildEvents(streamId: StreamId): BuildEvent[] {
    return [];
  }

  fetchInvocation(streamId: StreamId): InvocationRef {
    const filePath = this.makePathFor(streamId.invocationId);
    let ref: InvocationRef;

    const refFile = path.join(filePath, 'ref.json');
    if (fs.existsSync(refFile)) {
      const content = fs.readFileSync(refFile, {encoding: 'utf8'});
      ref = JSON.parse(content) as InvocationRef;
    } else {
      this.logger.warn(`No persisted ref found for ${refFile}`);
    }

    const logFile = path.join(filePath, 'ref.log');
    if (fs.existsSync(logFile)) {
      const log = fs.readFileSync(logFile, {encoding: 'utf8'});
      ref.progress = log.split('\n');
    }

    return ref;
  }

  private makePathFor(invocationId: string, ...extra: string[]): string {
    const cwd = process.env.BUILD_WORKSPACE_DIRECTORY ?? process.cwd();
    return path.join(cwd, this.config.base, 'invocations', invocationId, ...extra);
  }
}
