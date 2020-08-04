import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { BruService } from '../../../services/bru.service';
import { ConfigService } from '../../../services/config.service';
import { extractTarget } from '../target-dashboard-utils';

@Component({
  selector: 'bru-test-log-view',
  templateUrl: './test-log-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestLogViewComponent implements OnInit {
  data$: Observable<string[]>;

  constructor(private readonly http: HttpClient,
              private readonly route: ActivatedRoute,
              private readonly config: ConfigService,
              private readonly bru: BruService) {}

  ngOnInit(): void {
    this.data$ = extractTarget(this.route, this.bru)
      .pipe(
        filter(target => !!(target.testResult && target.testResult.log)),
        switchMap(target => {
          const uri = target.testResult.log.location;
          return this.http.get(`http://${this.config.getHost()}:3001${uri}`,
            { headers: { Accept: 'text/plain' }, responseType: 'text' });
        }),
        map(data => data.split('\n')),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }
}
