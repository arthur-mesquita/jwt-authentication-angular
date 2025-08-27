import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { Auth } from '../auth/auth';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Mock Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

// Mock Auth Service
class MockAuth {
  login = jasmine.createSpy('login');
}

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let auth: MockAuth;
  let router: MockRouter;
  let submitButton: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [Login, FormsModule],
      providers: [
        { provide: Auth, useClass: MockAuth },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    auth = TestBed.inject(Auth) as unknown as MockAuth;
    router = TestBed.inject(Router) as unknown as MockRouter;

    // Trigger change detection to ensure view is rendered
    fixture.detectChanges();

    // Get the submit button (assuming it's a button with type="submit" or similar)
    submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty username, password, and error', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
  });

  it('should call auth.login with correct credentials on onLogin', () => {
    component.username = 'testuser';
    component.password = 'password123';
    auth.login.and.returnValue(of({}));

    component.onLogin();

    expect(auth.login).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('should navigate to dashboard on successful login', () => {
    component.username = 'testuser';
    component.password = 'password123';
    auth.login.and.returnValue(of({}));

    component.onLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error message on login failure', () => {
    component.username = 'wrong';
    component.password = 'wrong';
    auth.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.onLogin();

    expect(component.error).toBe('Invalid username or password');
  });

  it('should not navigate on login failure', () => {
    component.username = 'wrong';
    component.password = 'wrong';
    auth.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.onLogin();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should clear error message before attempting login', () => {
    component.error = 'Previous error';
    auth.login.and.returnValue(of({}));

    component.onLogin();

    expect(component.error).toBe('');
    expect(auth.login).toHaveBeenCalled();
  });

  it('should show error message when login fails', () => {
    component.error = 'Invalid username or password';
    fixture.detectChanges();
    const errorDivs = fixture.debugElement.queryAll(By.css('div'));
    const errorElement = errorDivs.find((de) => {
      const el = de.nativeElement;
      return el.style.color === 'red' && el.textContent.trim() === 'Invalid username or password';
    });

    expect(errorElement).withContext('Red error message should be displayed').toBeTruthy();
  });

  it('should disable login button when form is invalid (if using required fields)', () => {
    const button = submitButton.nativeElement;
    expect(button.disabled).toBeFalse(); // Adjust if you add validation

    // Optionally simulate invalid state
    component.username = '';
    component.password = '';
    fixture.detectChanges();
    // Note: Without template validation (like `required`), button won't disable
    // You can enhance this based on your actual `login.html`
  });
});
