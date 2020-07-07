import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface InfoHeaderItem {
  key: string;
  value: string | number;
  transform?: string;
  link?: any[];
}

export type InfoHeaderItems = InfoHeaderItem[];

@Component({
  selector: 'bru-info-header',
  templateUrl: './info-header.component.html',
  styleUrls: ['./info-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoHeaderComponent {
  @Input() items: InfoHeaderItems = [];

  _dataTrackBy(index: number, data: InfoHeaderItem) {
    return data.key;
  }

}
