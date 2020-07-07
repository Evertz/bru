import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { DashPipeModule } from '../../common/dash-pipe/dash.pipe';
import { SummaryBarModule } from '../../common/summary-bar/summary-bar.module';
import { InvocationDashboardComponent } from './invocation-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    FlexLayoutModule,
    RouterModule.forChild([]),
    DashPipeModule,
    SummaryBarModule
  ],
  exports: [],
  declarations: [
    InvocationDashboardComponent,
  ],
  providers: []
})
export class InvocationDashboardModule {}
