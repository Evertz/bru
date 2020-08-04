import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { BesModule } from './bes/bes.module';
import { DashModule } from './dash/dash.module';
import { PersistenceModule } from './persistence/persistence.module';
import { LocalFilePersistenceProvider } from './persistence/build-events-providers/local-file.provider';
import { LocalFileCasProvider } from './persistence/cache-providers/local-file.provider';

@Module({
  imports: [
    BesModule,
    DashModule,
    PersistenceModule.withConfig({
      buildEventsPersistenceProvider: LocalFilePersistenceProvider,
      buildEventsPersistenceConfig: {
        base: 'storage'
      },
      cachePersistenceProvider: LocalFileCasProvider,
      cachePersistenceConfig: {
        base: 'storage'
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: '/site/prodapp'
    })
  ]
})
export class AppModule {}
