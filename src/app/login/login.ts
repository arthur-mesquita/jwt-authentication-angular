import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(private auth: Auth, private router: Router) {}

  onLogin() {
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // Redirect after login
      },
      error: () => {
        this.error = 'Invalid username or password';
      },
    });
  }
}
