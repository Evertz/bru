import { Module } from '@nestjs/common';

import { DashGateway } from './dash.gateway';
import { DashService } from './dash.service';
import { DashController } from './dash.controller';

@Module({
  providers: [
    DashService,
    DashGateway
  ],
  controllers: [
    DashController
  ]
})
export class DashModule {}
