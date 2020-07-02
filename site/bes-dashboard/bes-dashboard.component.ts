import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { InfoHeaderItems } from '../common/info-header/info-header.component';
import { Bes2Service } from '../services/bes2.service';
import { InvocationDetails } from '../../types/invocation-ref';

@Component({
  selector: 'bes-dashboard',
  templateUrl: './bes-dashboard.component.html',
  styleUrls: ['./bes-dashboard.component.scss']
})
export class BesDashboardComponent implements OnInit {
  metadata$: Observable<InvocationDetails>;
  infoheader$: Observable<InfoHeaderItems>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bes: Bes2Service) {}

  ngOnInit() {
    const invocation$ = this.route.paramMap.pipe(map(values => values.get(Bes2Service.INVOCATION_URL_PARAM)));
    this.metadata$ = invocation$
      .pipe(
        switchMap(id => this.bes.registerForInvocationDetails(id)),
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
