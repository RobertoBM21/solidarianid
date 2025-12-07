import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import request from 'supertest';
import { setupMvcApp } from '../src/presentation/setup-mvc';
import { AdminModule } from './../src/admin.module';

describe('AdminController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupMvcApp(app, join(__dirname, '..'));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Content-Type', /text\/html/);

    expect(res.text).toContain('<title>Inicio</title>');
  });
});
