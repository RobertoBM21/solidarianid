import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import request from 'supertest';
import { AdminModule } from '../../src/admin.module';
import { LoggedInGuard } from '../../src/authentication/infrastructure/presentation/guards/logged-in.guard';
import { setupMvcApp } from '../../src/presentation/setup-mvc';

describe('AdminController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminModule],
    })
      .overrideGuard(LoggedInGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    setupMvcApp(app, join(__dirname, '../../src'));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) redirects to dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.FOUND);

    expect(res.headers.location).toBe('/dashboard');
  });
});
