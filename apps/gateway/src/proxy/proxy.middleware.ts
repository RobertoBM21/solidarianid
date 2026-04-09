import { INestApplication } from '@nestjs/common';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyConfig } from './proxy.config';

export function setupProxy(app: INestApplication) {
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  const routes = proxyConfig();

  for (const route of routes) {
    const isCatchAll = route.path === '/';
    expressApp.use(
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        ws: route.ws ?? false,
        ...(isCatchAll ? {} : { pathFilter: route.path }),
      }),
    );
  }
}
