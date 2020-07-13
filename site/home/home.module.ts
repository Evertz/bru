import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BuildResultIconPipe, BuildResultStylePipe, HomeComponent } from './home.component';
import { DashPipeModule } from '../common/dash-pipe/dash.pipe';
import { InfoHeaderModule } from '../common/info-header/info-header.module';
import { SummaryBarModule } from '../common/summary-bar/summary-bar.module';

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    FlexLayoutModule,
    DashPipeModule,
    InfoHeaderModule,
    SummaryBarModule,
    RouterModule.forChild([]),
  ],
  exports: [],
  declarations: [
    HomeComponent,
    BuildResultIconPipe,
    BuildResultStylePipe
  ],
  providers: []
})
export class HomeModule {}
