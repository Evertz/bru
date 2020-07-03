import { Module } from '@nestjs/common';

import { BesModule } from './bes/bes.module';
import { DashModule } from './dash/dash.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [
    BesModule,
    DashModule,
    PersistenceModule
  ],
})
export class AppModule {}
