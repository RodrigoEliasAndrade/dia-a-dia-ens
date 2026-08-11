import type { Page, Route } from '@playwright/test';

const USER_ID = '11111111-1111-4111-8111-111111111111';

export interface SupabaseMockState {
  recoveryEmail: string | null;
  spouseEmail: string | null;
  loggedOut: boolean;
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    },
    body: body === undefined ? '' : JSON.stringify(body),
  });
}

export async function installSupabaseMock(page: Page): Promise<SupabaseMockState> {
  const state: SupabaseMockState = {
    recoveryEmail: null,
    spouseEmail: null,
    loggedOut: false,
  };

  await page.route('http://127.0.0.1:54321/**', async route => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
      await json(route, undefined, 204);
      return;
    }

    if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') {
      const now = new Date().toISOString();
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      await json(route, {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: expiresAt,
        refresh_token: 'test-refresh-token',
        user: {
          id: USER_ID,
          aud: 'authenticated',
          role: 'authenticated',
          email: 'pessoa@example.com',
          email_confirmed_at: now,
          phone: '',
          confirmed_at: now,
          last_sign_in_at: now,
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: {},
          identities: [],
          created_at: now,
          updated_at: now,
          is_anonymous: false,
        },
      });
      return;
    }

    if (url.pathname === '/auth/v1/recover') {
      const body = request.postDataJSON() as { email?: string };
      state.recoveryEmail = body.email ?? null;
      await json(route, {});
      return;
    }

    if (url.pathname === '/auth/v1/logout') {
      state.loggedOut = true;
      await json(route, undefined, 204);
      return;
    }

    if (url.pathname === '/auth/v1/user') {
      await json(route, {
        id: USER_ID,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'pessoa@example.com',
      });
      return;
    }

    if (url.pathname === '/rest/v1/rpc/check_and_pair') {
      await json(route, null);
      return;
    }

    if (url.pathname === '/rest/v1/profiles') {
      if (request.method() === 'PATCH') {
        const body = request.postDataJSON() as { spouse_email?: string };
        state.spouseEmail = body.spouse_email ?? null;
      }

      if (url.searchParams.get('id')?.startsWith('neq.')) {
        await json(route, []);
        return;
      }

      await json(route, [{
        id: USER_ID,
        display_name: 'Pessoa de Teste',
        couple_id: null,
        spouse_email: state.spouseEmail,
      }]);
      return;
    }

    if (url.pathname === '/rest/v1/user_data' || url.pathname === '/rest/v1/couple_data') {
      await json(route, []);
      return;
    }

    await json(route, {});
  });

  return state;
}
