import {
  ChangeDetectionStrategy,
  Component, Directive,
  Input,
  Pipe,
  PipeTransform
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { isObservable, of, Observable } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';

export interface SummaryBarItem<T extends any> {
  key: string;
  value: T | Observable<T> | Promise<T>;
  transform?: string;
  icon?: string;
  link?: string[];
  canCopy?: boolean;
}

export type SummaryBarItems = Array<SummaryBarItem<any>>;

@Pipe({ name: 'valueAsAsyncValue' })
export class ValueAsAsyncPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value === undefined || value === null) { return value; }
    if (isObservable(value) || typeof value.then === 'function') { return value; }
    return of(value);
  }
}

@Directive({ selector: 'bruSummaryTitle' })
export class SummaryItemTitleDirective { }

@Directive({ selector: 'bruSummaryValue' })
export class SummaryItemValueDirective { }

@Component({
  selector: 'bru-summary-item',
  template: `
    <div class="bru-summary-item" fxLayout="column" fxLayoutAlign="center" fxFlex="1 1">
      <span class="bru-subtitle">
        <ng-content select="[bruSummaryTitle]"></ng-content>
      </span>
      <div fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="6px">
        <span class="bru-summary-item-value">
          <ng-content select="[bruSummaryValue]"></ng-content>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./summary-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryItemComponent {}

@Component({
  selector: 'bru-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryBarComponent {
  @Input() items: SummaryBarItems = [];

  constructor(private readonly snackbar: MatSnackBar,
              private readonly clipboard: Clipboard) {}

  _itemTrackBy(index: number, item: SummaryBarItem<any>) {
    return item.key;
  }

  onCopyClick(target: string) {
    this.clipboard.copy(target);
    this.snackbar.open('Copied label to clipboard', 'CLOSE', { duration: 3000 });
  }
}
