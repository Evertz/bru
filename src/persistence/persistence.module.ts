import { Global, Module } from '@nestjs/common';

import { DEFAULT_PERSISTENCE_PROVIDER, PersistenceService } from './persistence.service';
import { LocalFilePersistenceProvider } from './providers/local-file.provider';

@Global()
@Module({
  providers: [
    PersistenceService,
    LocalFilePersistenceProvider,
    { provide: DEFAULT_PERSISTENCE_PROVIDER, useExisting: LocalFilePersistenceProvider }
  ],
  exports: [
    PersistenceService
  ]
})
export class PersistenceModule {}
