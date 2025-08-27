import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth, User } from './auth';
import { HttpClient } from '@angular/common/http';

describe('Auth Service', () => {
  let service: Auth;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  const mockUsers = [
    {
      id: 1,
      username: 'user',
      password: 'password',
      email: 'user@example.com',
      role: 'user',
      token: 'user-token',
    },
    {
      id: 2,
      username: 'admin',
      password: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      token: 'admin-token',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    service['currentUserSubject'].next(null);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user from localStorage on init if available', () => {
    const savedUser: User = mockUsers[0];

    localStorage.setItem('currentUser', JSON.stringify(savedUser));

    // Recreate service to trigger constructor logic
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [],
      providers: [Auth, provideHttpClient()],
    });
    service = TestBed.inject(Auth);

    expect(service.currentUser).toEqual(savedUser);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should not set user on init if no localStorage user', () => {
    expect(service.currentUser).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should log in successfully with valid credentials', waitForAsync(() => {
    const loginData = { username: 'user', password: 'password' };
    const { password, ...expectedUser } = mockUsers[0];

    service.login(loginData.username, loginData.password).subscribe({
      next: (user) => {
        expect(user).toEqual(expectedUser);
        expect(service.isLoggedIn()).toBeTrue();
        expect(service.currentUser).toEqual(expectedUser);
        expect(localStorage.getItem('currentUser')).toEqual(JSON.stringify(expectedUser));
      },
      error: () => fail('should not emit error'),
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    req.flush(mockUsers);
  }));

  it('should fail login with invalid credentials', waitForAsync(() => {
    const loginData = { username: 'unknown', password: 'wrong' };

    service.login(loginData.username, loginData.password).subscribe({
      next: () => fail('should not emit user'),
      error: (error) => {
        expect(error.message).toContain('Invalid credentials');
        expect(service.isLoggedIn()).toBeFalse();
        expect(service.currentUser).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
      },
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    req.flush(mockUsers);
  }));

  it('should log out and clear user data', () => {
    const user: User = mockUsers[0];

    localStorage.setItem('currentUser', JSON.stringify(user));
    service['currentUserSubject'].next(user);

    expect(service.isLoggedIn()).toBeTrue();

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('should expose currentUser via getter', () => {
    const user: User = mockUsers[0];

    service['currentUserSubject'].next(user);

    expect(service.currentUser).toEqual(user);
  });

  it('should update currentUser$ observable on login', waitForAsync(() => {
    const loginData = { username: 'admin', password: 'admin' };

    service.currentUser$.subscribe((user) => {
      if (user) {
        expect(user.username).toBe('admin');
      }
    });

    service.login(loginData.username, loginData.password).subscribe();

    const req = httpMock.expectOne('/api/users');
    req.flush(mockUsers);
  }));
});
