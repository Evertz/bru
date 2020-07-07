import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { InfoHeaderItems } from '../common/info-header/info-header.component';
import { BruService } from '../services/bru.service';
import { InvocationDetails } from '../../types/invocation-ref';

@Component({
  selector: 'bru-dashboard',
  templateUrl: './bru-dashboard.component.html',
  styleUrls: ['./bru-dashboard.component.scss']
})
export class BruDashboardComponent implements OnInit {
  metadata$: Observable<InvocationDetails>;
  infoheader$: Observable<InfoHeaderItems>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bru: BruService) {}

  ngOnInit() {
    const invocation$ = this.route.paramMap.pipe(map(values => values.get(BruService.INVOCATION_URL_PARAM)));
    this.metadata$ = invocation$
      .pipe(
        switchMap(id => this.bru.registerForInvocationDetails(id)),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    this.infoheader$ = combineLatest([invocation$, this.metadata$])
      .pipe(
        map(([invocation, metadata]) => {
          return [
            {key: 'Command', value: metadata.command, transform: 'titlecase'},
            {key: 'Pattern', value: metadata.pattern?.join(' ')},
            {key: 'Invocation', value: invocation},
            {key: 'Start time', value: metadata.startTimeMillis, transform: 'date'},
            {key: 'End time', value: metadata.finishTimeMillis, transform: 'date'},
            {key: 'Exit state', value: metadata.exitCode?.name, transform: 'titlecase'}
          ];
        }),
        startWith([])
      );

  }
}
