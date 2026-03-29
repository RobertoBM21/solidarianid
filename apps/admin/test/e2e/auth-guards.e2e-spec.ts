import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import request from 'supertest';
import { AdminModule } from '../../src/admin.module';
import { AuthPort } from '../../src/authentication/application/ports/auth.port';
import { setupMvcApp } from '../../src/presentation/setup-mvc';

describe('Auth Guards (e2e)', () => {
  let app: NestExpressApplication;
  const mockAuthPort = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminModule],
    })
      .overrideProvider(AuthPort)
      .useValue(mockAuthPort)
      .compile();

    app = moduleFixture.createNestApplication();
    setupMvcApp(app, join(__dirname, '../../src'));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unauthenticated User', () => {
    it('should be redirected to /auth/login when accessing protected route (/)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(HttpStatus.FOUND)
        .expect('Location', '/auth/login');
    });

    it('should be able to access /auth/login', () => {
      return request(app.getHttpServer())
        .get('/auth/login')
        .expect(HttpStatus.OK);
    });

    it('should be able to access /auth/register', () => {
      return request(app.getHttpServer())
        .get('/auth/register')
        .expect(HttpStatus.OK);
    });
  });

  describe('Authenticated User', () => {
    let agent: request.Agent;

    beforeEach(async () => {
      mockAuthPort.login.mockResolvedValue({
        isLeft: () => false,
        value: { id: 'mock-user-id-123' },
      });

      agent = request.agent(app.getHttpServer());

      await agent
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password' })
        .expect(HttpStatus.CREATED);
    });

    it('should be able to access protected route (/comunidades/validaciones)', () => {
      return agent.get('/comunidades/validaciones').expect(HttpStatus.OK);
    });

    it('should show user icon in header when logged in', async () => {
      const res = await agent
        .get('/comunidades/validaciones')
        .expect(HttpStatus.OK);
      expect(res.text).toContain('fa-user');
      expect(res.text).toContain('/auth/logout');
    });

    it('should be redirected to / when accessing /auth/login (LoggedOutGuard)', () => {
      return agent
        .get('/auth/login')
        .expect(HttpStatus.FOUND)
        .expect('Location', '/');
    });

    it('should be redirected to / when accessing /auth/register (LoggedOutGuard)', () => {
      return agent
        .get('/auth/register')
        .expect(HttpStatus.FOUND)
        .expect('Location', '/');
    });

    it('should be able to logout and lose access', async () => {
      await agent
        .get('/auth/logout')
        .expect(HttpStatus.FOUND)
        .expect('Location', '/auth/login');

      return agent
        .get('/')
        .expect(HttpStatus.FOUND)
        .expect('Location', '/auth/login');
    });
  });
});
