import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BesDashboardModule } from './bes-dashboard/bes-dashboard.module';
import { FetchedListModule } from './bes-dashboard/invocation-dashboard/fetched-list/fetched-list.module';
import { InvocationDashboardModule } from './bes-dashboard/invocation-dashboard/invocation-dashboard.module';
import { InvocationDetailsModule } from './bes-dashboard/invocation-dashboard/invocation-details/invocation-details.module';
import { InvocationLogModule } from './bes-dashboard/invocation-dashboard/invocation-log/invocation-log.module';
import { TargetDetailsModule } from './bes-dashboard/invocation-dashboard/target-details/target-details.module';
import { TargetDashboardModule } from './bes-dashboard/target-dashboard/target-dashboard.module';
import { HomeModule } from './home/home.module';
import { BesService } from './services/bes.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FlexLayoutModule,
    // internal
    AppRoutingModule,
    HomeModule,
    BesDashboardModule,
    InvocationDashboardModule,
    FetchedListModule,
    InvocationDetailsModule,
    InvocationLogModule,
    TargetDetailsModule,
    TargetDashboardModule
  ],
  providers: [
    BesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
