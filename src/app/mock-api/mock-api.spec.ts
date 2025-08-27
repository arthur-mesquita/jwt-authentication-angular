import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { mockApiInterceptor } from './mock-api';
import { TestBed } from '@angular/core/testing';

describe('mockApiInterceptor', () => {
  let interceptor: HttpInterceptorFn;

  // Mock HttpHandlerFn that just returns an observable (should not be called if intercepted)
  const next: HttpHandlerFn = (req: HttpRequest<unknown>) =>
    of(new HttpResponse({ status: 500, statusText: 'Not Handled' }));

  beforeEach(() => {
    TestBed.configureTestingModule({});

    interceptor = mockApiInterceptor;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should intercept POST /api/users with valid credentials and return user data', (done: DoneFn) => {
    const request = new HttpRequest('POST', '/api/users', {
      username: 'user',
      password: 'password',
    });

    const stream$ = interceptor(request, next);
    stream$.subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect(event.body).toEqual([
            {
              id: 1,
              username: 'user',
              email: 'user@example.com',
              password: 'password',
              role: 'user',
              token: 'mocked-jwt-token-for-user',
              tokenExpiration: jasmine.any(Number),
            },
          ]);
          done();
        }
      },
      error: done.fail,
    });
  });

  it('should intercept POST /api/users with admin credentials and return admin data', (done: DoneFn) => {
    const request = new HttpRequest('POST', '/api/users', {
      username: 'admin',
      password: 'admin',
    });

    const stream$ = interceptor(request, next);
    stream$.subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          const user = (event.body as any[])[0];
          expect(user.username).toBe('admin');
          expect(user.role).toBe('admin');
          expect(user.token).toBe('mocked-jwt-token-for-admin');
          done();
        }
      },
      error: done.fail,
    });
  });

  it('should return 401 for invalid credentials', (done: DoneFn) => {
    const request = new HttpRequest('POST', '/api/users', {
      username: 'unknown',
      password: 'wrong',
    });

    const stream$ = interceptor(request, next);
    stream$.subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(401);
          expect(event.statusText).toBe('Unauthorized');
          done();
        }
      },
      error: done.fail,
    });
  });

  it('should not intercept non-matching URLs and pass through to next handler', (done: DoneFn) => {
    const request = new HttpRequest('GET', '/api/other');

    // Spy on next handler
    const nextSpy = jasmine.createSpy('nextHandler', next).and.callThrough();

    const stream$ = interceptor(request, nextSpy);
    stream$.subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(500); // Comes from mock next handler
          expect(nextSpy).toHaveBeenCalled();
          done();
        }
      },
      error: done.fail,
    });
  });
});
