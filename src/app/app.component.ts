import { CommonModule } from '@angular/common';
import { Component, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthGoogleService } from '@services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'treasure-island-reporting';
  profile: WritableSignal<any>;

  constructor(
    private authGoogleService: AuthGoogleService
  ) {
    this.profile = this.authGoogleService.profile;
  }

  login() {
    this.authGoogleService.login();
  }

  logOut() {
    this.authGoogleService.logout();
  }
}
