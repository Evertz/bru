import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { BesModule } from './bes/bes.module';
import { DashModule } from './dash/dash.module';
import { PersistenceModule } from './persistence/persistence.module';
import { LocalFilePersistenceProvider } from './persistence/providers/local-file.provider';

@Module({
  imports: [
    BesModule,
    DashModule,
    PersistenceModule.withConfig({
      defaultProvider: LocalFilePersistenceProvider,
      providerConfig: {
        base: 'storage'
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: '/site/prodapp'
    })
  ]
})
export class AppModule {}
