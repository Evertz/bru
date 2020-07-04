import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { BesService } from '../../../services/bes.service';
import {
  HostDetails,
  InvocationDetails,
  StructuredCommandLine,
  WorkspaceStatusItems
} from '../../../../types/invocation-ref';

@Component({
  selector: 'bes-invocation-details',
  templateUrl: './invocation-details.component.html',
  styleUrls: ['./invocation-details.component.scss']
})
export class InvocationDetailsComponent implements OnInit {
  details$: Observable<InvocationDetails>;
  workspaceStatus$: Observable<WorkspaceStatusItems>;
  commandLine$: Observable<StructuredCommandLine>;
  hostDetails$: Observable<HostDetails>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bes: BesService) {}

  ngOnInit() {
    const invocation$ = this.route.parent.paramMap
      .pipe(
        map(values => values.get(BesService.INVOCATION_URL_PARAM))
      );

    this.details$ = invocation$
      .pipe(
        switchMap(id => this.bes.registerForInvocationDetails(id)),
        shareReplay({ refCount: true, bufferSize: 1 })
      );

    this.workspaceStatus$ = invocation$
      .pipe(switchMap(id => this.bes.getWorkspaceStatus(id)));

    this.commandLine$ = invocation$
      .pipe(switchMap(id => this.bes.getStructuredCommandLine(id)));

    this.hostDetails$ = invocation$
      .pipe(switchMap(id => this.bes.getHostDetails(id)));
  }
}
