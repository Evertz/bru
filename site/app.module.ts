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
import { BruDashboardModule } from './bru-dashboard/bru-dashboard.module';
import { FetchedListModule } from './bru-dashboard/invocation-dashboard/fetched-list/fetched-list.module';
import { InvocationDashboardModule } from './bru-dashboard/invocation-dashboard/invocation-dashboard.module';
import { InvocationDetailsModule } from './bru-dashboard/invocation-dashboard/invocation-details/invocation-details.module';
import { InvocationLogModule } from './bru-dashboard/invocation-dashboard/invocation-log/invocation-log.module';
import { TargetDetailsModule } from './bru-dashboard/invocation-dashboard/target-details/target-details.module';
import { TargetDashboardModule } from './bru-dashboard/target-dashboard/target-dashboard.module';
import { HomeModule } from './home/home.module';

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
    BruDashboardModule,
    InvocationDashboardModule,
    FetchedListModule,
    InvocationDetailsModule,
    InvocationLogModule,
    TargetDetailsModule,
    TargetDashboardModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
