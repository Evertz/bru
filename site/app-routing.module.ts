import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BruDashboardComponent } from './bru-dashboard/bru-dashboard.component';
import { FetchedListComponent } from './bru-dashboard/invocation-dashboard/fetched-list/fetched-list.component';
import { InvocationDashboardComponent } from './bru-dashboard/invocation-dashboard/invocation-dashboard.component';
import { InvocationDetailsComponent } from './bru-dashboard/invocation-dashboard/invocation-details/invocation-details.component';
import { InvocationLogComponent } from './bru-dashboard/invocation-dashboard/invocation-log/invocation-log.component';
import { TargetDetailsComponent } from './bru-dashboard/invocation-dashboard/target-details/target-details.component';
import { TargetDashboardComponent } from './bru-dashboard/target-dashboard/target-dashboard.component';
import { TestLogViewComponent } from './bru-dashboard/target-dashboard/test-log-view/test-log-view.component';
import { HomeComponent } from './home/home.component';
import { ArtifactsListComponent } from './bru-dashboard/target-dashboard/artifacts-list/artifacts-list.component';

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
        children: [
          {
            path: 'log',
            component: TestLogViewComponent,
          },
          {
            path: 'artifacts',
            component: ArtifactsListComponent,
          }
        ]
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
