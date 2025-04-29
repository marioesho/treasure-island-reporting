import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { GmailService } from '@services';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private gmailService: GmailService, private router: Router) {}

  async login() {
    await this.gmailService.signIn();
    this.router.navigate(['/dashboard']);
  }
}
