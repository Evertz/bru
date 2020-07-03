import { DynamicModule, Global, Module, Type } from '@nestjs/common';

import { DEFAULT_PERSISTENCE_PROVIDER, PersistenceService } from './persistence.service';
import { LocalFilePersistenceProvider, LocalFileProviderConfig } from './providers/local-file.provider';
import { NoopPersistenceProvider } from './providers/noop.provider';
import { PERSISTENCE_PROVIDER_CONFIG, PersistenceProvider } from './persistence.provider';

export type PersistenceModuleConfig = {
  defaultProvider: Type<PersistenceProvider>;
  providerConfig?: LocalFileProviderConfig
}

@Global()
@Module({
  providers: [
    PersistenceService,
    LocalFilePersistenceProvider,
    NoopPersistenceProvider
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
        { provide: DEFAULT_PERSISTENCE_PROVIDER, useExisting: config.defaultProvider },
        { provide: PERSISTENCE_PROVIDER_CONFIG, useValue: config.providerConfig }
      ]
    }
  }
}
