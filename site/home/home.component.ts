import { ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BesService } from '../services/bes.service';

@Component({
  selector: 'bes-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private readonly router: Router,
              private readonly bes: BesService) {}

  ngOnInit() {}

  onKeypress(event: KeyboardEvent, value: string) {
    if (event.keyCode === ENTER && !!value) {
      //this.bes.registerForInvocationId(value);
       this.router.navigate(['/', 'invocation', value]);
    }
  }
}
