import {
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpInterceptorFn,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_USERS = [
  {
    id: 1,
    username: 'user',
    email: 'user@example.com',
    password: 'password', // In a real app, passwords should be hashed
    role: 'user',
    token: 'mocked-jwt-token-for-user',
    tokenExpiration: Date.now() + 3600 * 1000,
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin',
    role: 'admin',
    token: 'mocked-jwt-token-for-admin',
  },
  {
    id: 3,
    username: 'userWithExpiredToken',
    email: 'expiration@example.com',
    password: 'password',
    role: 'user',
    token: 'mocked-jwt-token-for-user',
    tokenExpiration: Date.now() + 3600 * 1000,
  },
];

export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (req.url.endsWith('/api/users') && req.method === 'POST') {
    const { username, password } = req.body as { username: string; password: string };

    const user = MOCK_USERS.find((u) => u.username === username && u.password === password);

    if (user) {
      return of(
        new HttpResponse({
          status: 200,
          body: [user],
        })
      ).pipe(delay(300));
    } else {
      const errorResponse = new HttpResponse({
        status: 401,
        statusText: 'Unauthorized',
      });

      return of(errorResponse).pipe(delay(300));
    }
  }

  return next(req);
};
