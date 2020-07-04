import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BesService } from '../../../services/bes.service';
import { FetchedResource } from '../../../../types/invocation-ref';

@Component({
  selector: 'bes-fetched-list',
  templateUrl: './fetched-list.component.html',
  styleUrls: ['./fetched-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FetchedListComponent implements OnInit {
  fetched$: Observable<FetchedResource[]>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bes: BesService) {}

  ngOnInit() {
    this.fetched$ = this.route.parent.paramMap
      .pipe(
        map(values => values.get(BesService.INVOCATION_URL_PARAM)),
        switchMap(id => this.bes.registerForFetchedResources(id))
      );
  }
}
