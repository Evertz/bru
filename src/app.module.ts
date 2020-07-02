import { Module } from '@nestjs/common';

import { BesModule } from './bes/bes.module';
import { DashModule } from './dash/dash.module';

@Module({
  imports: [
    BesModule,
    DashModule
  ],
})
export class AppModule {}
