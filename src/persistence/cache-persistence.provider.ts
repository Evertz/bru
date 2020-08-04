import { WriteStream } from 'fs';

import { ActionResult } from '../../types/messages/remote-execution';

export const CACHE_PERSISTENCE_CONFIG = Symbol.for('CachePersistenceConfig');

/**
 * Provides CAS and AC persistence for the build cache, generally accessed via the persistence service
 */
export abstract class CachePersistenceProvider {
  /**
   * Writes the action result to the underlying storage
   */
  abstract persistActionResult(key: string, actionResult: ActionResult);

  /**
   * Fetches an action result based on a key from the underlying storage.
   * May return undefined if the result is not found
   * @param key
   */
  abstract fetchActionResult(key: string): ActionResult;

  /**
   * Starts writing a build artifact to the storage
   */
  abstract persistBuildArtifact(key: string, data?: Buffer): WriteStream;

  /**
   * Fetches a build artifact from the underlying storage
   * @param key
   */
  abstract fetchBuildArtifact(key: string): Buffer | undefined;

  /**
   * Returns true if this provider can fetch the requested artifact
   */
  abstract hasBuildArtifact(key: string): boolean;
}
