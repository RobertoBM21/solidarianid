import { getSecretFromEnvVar } from '@app/shared/utils';
import { INestApplication } from '@nestjs/common';
import { Express, Request } from 'express';
import { ClientRequest } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { verify } from 'jsonwebtoken';
import { proxyConfig } from './proxy.config';

function addAuthHeaders(
  proxyReq: ClientRequest,
  req: Request,
  jwtSecret: string,
): void {
  // Always strip x-user-id coming from outside, only the gateway sets it
  proxyReq.removeHeader('x-user-id');

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verify(token, jwtSecret) as { sub: string };
    proxyReq.setHeader('x-user-id', payload.sub);
  } catch {
    // Invalid or expired token don't set header, let core guards decide
  }
}

export function setupProxy(app: INestApplication) {
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  const routes = proxyConfig();
  const jwtSecret = getSecretFromEnvVar('JWT_SECRET');

  for (const route of routes) {
    const isCatchAll = route.path === '/';
    const excludedPaths = route.exclude ?? [];

    expressApp.use(
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        ws: route.ws ?? false,
        ...(isCatchAll
          ? {
              pathFilter: (path: string) =>
                !excludedPaths.some((p) => path.startsWith(p)),
            }
          : { pathFilter: route.path }),
        on: {
          proxyReq: (proxyReq, req) => {
            addAuthHeaders(proxyReq, req as Request, jwtSecret);
          },
        },
      }),
    );
  }
}
