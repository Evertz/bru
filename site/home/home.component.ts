import { ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'bru-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private readonly router: Router) {}

  ngOnInit() {}

  onKeypress(event: KeyboardEvent, value: string) {
    if (event.keyCode === ENTER && !!value) {
       this.router.navigate(['/', 'invocation', value]);
    }
  }
}
