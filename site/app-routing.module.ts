import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BruDashboardComponent } from './bru-dashboard/bru-dashboard.component';
import { FetchedListComponent } from './bru-dashboard/invocation-dashboard/fetched-list/fetched-list.component';
import { InvocationDashboardComponent } from './bru-dashboard/invocation-dashboard/invocation-dashboard.component';
import { InvocationDetailsComponent } from './bru-dashboard/invocation-dashboard/invocation-details/invocation-details.component';
import { InvocationLogComponent } from './bru-dashboard/invocation-dashboard/invocation-log/invocation-log.component';
import { TargetDetailsComponent } from './bru-dashboard/invocation-dashboard/target-details/target-details.component';
import { TargetDashboardComponent } from './bru-dashboard/target-dashboard/target-dashboard.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'invocation/:invocation',
    component: BruDashboardComponent,
    children: [
      {
        path: '',
        component: InvocationDashboardComponent,
        children: [
          {
            path: 'targets',
            component: TargetDetailsComponent
          },
          {
            path: 'log',
            component: InvocationLogComponent
          },
          {
            path: 'details',
            component: InvocationDetailsComponent
          },
          {
            path: 'fetched',
            component: FetchedListComponent
          }
        ]
      },
      {
        path: 'targets/:label',
        component: TargetDashboardComponent,
        children: []
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
