// src/app/dashboard/dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { Auth } from '../auth/auth'; // Adjust path if needed
import { provideRouter, Router } from '@angular/router';
import { routes } from '../app.routes';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

class MockAuthService {
  currentUser$ = of({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    token: 'mocked-jwt-token',
  });
  logout = jasmine.createSpy('logout');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('DashboardComponent', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, Dashboard],
      providers: [
        provideRouter(routes),
        { provide: Auth, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    authService = TestBed.inject(Auth) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user data when user is logged in', () => {
    fixture.detectChanges();

    console.log(fixture.debugElement.nativeElement.innerHTML);

    const usernameElement = fixture.debugElement.query(By.css('#username'));
    const emailElement = fixture.debugElement.query(By.css('#email'));
    const roleElement = fixture.debugElement.query(By.css('#role'));
    const tokenElement = fixture.debugElement.query(By.css('#token'));

    expect(usernameElement).not.toBeNull();
    expect(emailElement).not.toBeNull();
    expect(roleElement).not.toBeNull();
    expect(tokenElement).not.toBeNull();

    expect(usernameElement!.nativeElement.textContent).toContain('testuser');
    expect(emailElement!.nativeElement.textContent).toContain('test@example.com');
    expect(roleElement!.nativeElement.textContent).toContain('user');
    expect(tokenElement!.nativeElement.textContent).toContain('mocked-jwt-token');
  });

  it('should not show "Not logged in" when user is logged in', () => {
    fixture.detectChanges();

    const dashboardText = fixture.debugElement.nativeElement.textContent;
    expect(dashboardText).not.toContain('Not logged in.');
  });

  it('should call logout and navigate to /login when logout button is clicked', () => {
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should display "Not logged in" when currentUser$ emits null', async () => {
    // Override the mock to return null
    (authService as any).currentUser$ = of(null);
    fixture.destroy();
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await fixture.whenStable();

    const notLoggedInElement = fixture.debugElement.query(By.css('p'));
    expect(notLoggedInElement.nativeElement.textContent).toContain('Not logged in.');
  });
});
