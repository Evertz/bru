import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BruService } from '../../../services/bru.service';

@Component({
  selector: 'bru-invocation-log',
  templateUrl: './invocation-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvocationLogComponent implements OnInit {
  log$: Observable<string>;
  line$: Observable<number>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bru: BruService) {}

  ngOnInit(): void {
    this.log$ = this.route.parent.paramMap
      .pipe(
        map(values => values.get(BruService.INVOCATION_URL_PARAM)),
        switchMap(id => this.bru.registerForProgress(id)),
      );

    this.line$ = this.route.fragment
      .pipe(map(line => Number(line)))
  }
}
