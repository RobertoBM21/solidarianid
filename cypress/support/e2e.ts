// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Provide a lightweight axios fallback if the page doesn't load it.
Cypress.on('window:before:load', (win) => {
  if (!(win as any).axios) {
    (win as any).axios = {
      post: (url: string, data?: any, options?: any) => {
        const headers = {
          'Content-Type': 'application/json',
          ...(options?.headers ?? {}),
        } as Record<string, string>;

        return fetch(url, {
          method: 'POST',
          headers,
          body: data !== undefined ? JSON.stringify(data) : undefined,
          credentials: 'same-origin',
        }).then(async (res) => {
          const contentType = res.headers.get('content-type') || '';
          let body: any = undefined;
          if (contentType.includes('application/json')) {
            try {
              body = await res.json();
            } catch {
              body = undefined;
            }
          } else {
            try {
              body = await res.text();
            } catch {
              body = undefined;
            }
          }

          if (!res.ok) {
            const error: any = new Error('Request failed');
            error.response = { status: res.status, data: body };
            throw error;
          }

          return { status: res.status, data: body };
        });
      },
    };
  }
});;
