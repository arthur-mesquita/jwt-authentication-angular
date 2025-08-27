import { Component } from '@angular/core';
import { Auth, User } from '../auth/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: `./dashboard.html`,
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [AsyncPipe],
})
export class Dashboard {
  user$: Observable<User | null>;

  constructor(private auth: Auth, private router: Router) {
    this.user$ = this.auth.currentUser$;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
