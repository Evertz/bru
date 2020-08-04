import { DynamicModule, Global, Module, Type } from '@nestjs/common';

import {
  DEFAULT_BUILD_EVENTS_PERSISTENCE_PROVIDER,
  DEFAULT_CACHE_PERSISTENCE_PROVIDER,
  PersistenceService
} from './persistence.service';
import { LocalFilePersistenceProvider, LocalFileProviderConfig as BELocalFileProviderConfig } from './build-events-providers/local-file.provider';
import { NoopPersistenceProvider } from './build-events-providers/noop.provider';
import { BUILD_EVENTS_PERSISTENCE_CONFIG, BuildEventsPersistenceProvider } from './build-events-persistence.provider';
import { CACHE_PERSISTENCE_CONFIG, CachePersistenceProvider } from './cache-persistence.provider';
import {
  LocalFileCasProvider,
  LocalFileProviderConfig as CacheLocalFileProviderConfig
} from './cache-providers/local-file.provider';

export type BuildEventsProviderConfig = BELocalFileProviderConfig;
export type CacheProviderConfig = CacheLocalFileProviderConfig;

export type PersistenceModuleConfig = {
  buildEventsPersistenceProvider: Type<BuildEventsPersistenceProvider>;
  buildEventsPersistenceConfig?: BuildEventsProviderConfig;
  cachePersistenceProvider: Type<CachePersistenceProvider>;
  cachePersistenceConfig?: CacheProviderConfig;
}

@Global()
@Module({
  providers: [
    PersistenceService,

    // build events
    LocalFilePersistenceProvider,
    NoopPersistenceProvider,

    // cas / ac
    LocalFileCasProvider
  ],
  exports: [
    PersistenceService
  ]
})
export class PersistenceModule {
  static withConfig(config: PersistenceModuleConfig): DynamicModule {
    return {
      module: PersistenceModule,
      providers: [
        { provide: DEFAULT_BUILD_EVENTS_PERSISTENCE_PROVIDER, useExisting: config.buildEventsPersistenceProvider },
        { provide: BUILD_EVENTS_PERSISTENCE_CONFIG, useValue: config.buildEventsPersistenceConfig },
        { provide: DEFAULT_CACHE_PERSISTENCE_PROVIDER, useExisting: config.cachePersistenceProvider },
        { provide: CACHE_PERSISTENCE_CONFIG, useValue: config.cachePersistenceConfig }
      ]
    }
  }
}
