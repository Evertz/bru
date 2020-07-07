import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BruService } from '../../../services/bru.service';
import { FetchedResource } from '../../../../types/invocation-ref';

@Component({
  selector: 'bru-fetched-list',
  templateUrl: './fetched-list.component.html',
  styleUrls: ['./fetched-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FetchedListComponent implements OnInit {
  fetched$: Observable<FetchedResource[]>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bru: BruService) {}

  ngOnInit() {
    this.fetched$ = this.route.parent.paramMap
      .pipe(
        map(values => values.get(BruService.INVOCATION_URL_PARAM)),
        switchMap(id => this.bru.registerForFetchedResources(id))
      );
  }
}
