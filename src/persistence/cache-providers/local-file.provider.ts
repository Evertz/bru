import * as fs from 'fs';
import * as path from 'path';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { CACHE_PERSISTENCE_CONFIG, CachePersistenceProvider } from '../cache-persistence.provider';
import { ActionResult } from '../../../types/messages/remote-execution';

export interface LocalFileProviderConfig {
  base: string;
}

@Injectable()
export class LocalFileCasProvider extends CachePersistenceProvider implements OnModuleInit {
  constructor(@Inject(CACHE_PERSISTENCE_CONFIG)
              private readonly config: LocalFileProviderConfig) {
    super();
  }

  onModuleInit(): any {
    const cwd = this.cwd();

    const ac = path.join(cwd, this.config.base, 'ac');
    if (!fs.existsSync(ac)) {
      fs.mkdirSync(ac, { recursive: true });
    }

    const cas = path.join(cwd, this.config.base, 'cas');
    if (!fs.existsSync(cas)) {
      fs.mkdirSync(cas, { recursive: true });
    }
  }

  fetchActionResult(key: string): ActionResult {
    const acPath = this.makeAcPath(key);
    if (!fs.existsSync(acPath)) { return; }

    const ac = fs.readFileSync(acPath, { encoding: 'utf8' });
    return JSON.parse(ac);
  }

  fetchBuildArtifact(key: string): Buffer | undefined {
    const casPath = this.makeCasPath(key);
    if (!this.hasBuildArtifact(key)) { return; }

    return fs.readFileSync(casPath);
  }

  hasBuildArtifact(key: string): boolean {
    const casPath = this.makeCasPath(key);
    return fs.existsSync(casPath);
  }

  persistActionResult(key: string, actionResult: ActionResult) {
    const acPath = this.makeAcPath(key);
    fs.writeFile(acPath, JSON.stringify(actionResult), { encoding: 'utf8' }, () => {});
  }

  persistBuildArtifact(key: string, data?: Buffer): fs.WriteStream {
    const casPath = this.makeCasPath(key);
    const stream = fs.createWriteStream(casPath, { encoding: 'utf8', emitClose: true });

    if (data) {
      stream.write(data);
    }

    return stream;
  }

  private makeCasPath(key: string, ...extra: string[]): string {
    return this.makePath(key, 'cas', ...extra);
  }

  private makeAcPath(key: string, ...extra: string[]): string {
    return this.makePath(key, 'ac', ...extra);
  }

  private makePath(key: string, type: string, ...extra: string[]): string {
    return path.join(this.cwd(), this.config.base, type, key, ...extra);
  }

  private cwd(): string {
    return process.env.BUILD_WORKSPACE_DIRECTORY ?? process.cwd();
  }

}
