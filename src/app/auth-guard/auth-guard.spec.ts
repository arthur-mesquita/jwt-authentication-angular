import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Auth } from '../auth/auth';
import { AuthGuard, authGuard } from './auth-guard';

// Mock classes
class MockAuth {
  isLoggedIn(): boolean {
    return true;
  }
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

const createActivatedRouteSnapshot = (params: any = {}): ActivatedRouteSnapshot => {
  return {
    url: [],
    params,
    outlet: 'primary',
    routeConfig: { path: '' },
    component: 'TestComponent',
    root: null!, // Will be set if needed
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    title: undefined,
    toString: () => `ActivatedRouteSnapshot Mock`,
  } as unknown as ActivatedRouteSnapshot;
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let auth: MockAuth;
  let router: MockRouter;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Auth, useClass: MockAuth },
        { provide: Router, useClass: MockRouter },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    auth = TestBed.inject(Auth) as unknown as MockAuth;
    router = TestBed.inject(Router) as unknown as MockRouter;
    state = { url: '/protected' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow activation if user is logged in', () => {
      spyOn(auth, 'isLoggedIn').and.returnValue(true);
      const route = createActivatedRouteSnapshot({ id: '123' });

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should deny activation and redirect to /login if user is not logged in', () => {
      spyOn(auth, 'isLoggedIn').and.returnValue(false);
      const route = createActivatedRouteSnapshot({ id: '123' });

      const result = guard.canActivate(route, state);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});

describe('authGuard (CanActivateFn)', () => {
  let authGuardFn: typeof authGuard;
  let guard: AuthGuard;
  let auth: MockAuth;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Auth, useClass: MockAuth },
        { provide: Router, useClass: MockRouter },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    auth = TestBed.inject(Auth) as unknown as MockAuth;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should return true when user is logged in', () => {
    const route = createActivatedRouteSnapshot({ id: '123' });
    const state = { url: '/protected' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate to login when user is not logged in', () => {
    spyOn(auth, 'isLoggedIn').and.returnValue(false);
    const route = createActivatedRouteSnapshot({ id: '123' });
    const state = { url: '/protected' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
