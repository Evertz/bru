import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'bes-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBarComponent {
  @Input() indeterminate = false;
  @Input() status: 'success' | 'failed' | 'unstable' | 'running' | 'queued' | 'interrupted' | string;
  @Input() title: string;
  @Input() progress = 0;
}
