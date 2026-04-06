import { INestApplication } from '@nestjs/common';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyConfig } from './proxy.config';

export function setupProxy(app: INestApplication) {
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  const routes = proxyConfig();

  for (const route of routes) {
    expressApp.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        ws: route.ws ?? false,
      }),
    );
  }
}
