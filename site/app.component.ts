import { DOCUMENT } from '@angular/common';
import { isDevMode, Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'bes-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isDevMode = isDevMode();

  constructor(private readonly snackbar: MatSnackBar,
              @Inject(DOCUMENT) private readonly doc: Document) { }

  onSupportClick(action: string) {
    this.snackbar.open(`Please ${action} via Slack on #dev-infrastructure`, 'OPEN SLACK', { duration: 5000 })
      .onAction()
      .subscribe(() => {
        this.doc.location.href = 'slack://channel?team=T5R2MMGJ0&id=CCARM6UG0';
      });
  }
}
