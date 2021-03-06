import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

import { InfoHeaderModule } from '../common/info-header/info-header.module';
import { StatusBarModule } from '../common/status-bar/status-bar.module';
import { BruDashboardComponent } from './bru-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([]),
    InfoHeaderModule,
    StatusBarModule
  ],
  exports: [],
  declarations: [
    BruDashboardComponent
  ],
  providers: []
})
export class BruDashboardModule {}
