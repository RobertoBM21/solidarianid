import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { join } from 'path';
import request from 'supertest';
import { AdminModule } from '../../src/admin.module';
import { setupMvcApp } from '../../src/presentation/setup-mvc';

describe('AuthController (MVC-e2e)', () => {
  let app: NestExpressApplication;

  const mockAxios = {
    post: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AdminModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupMvcApp(app, join(__dirname, '../../src'));
    await app.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/login', () => {
    it('should return the login form', async () => {
      mockAxios.post.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .get('/auth/login')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /text\/html/);
      document.body.innerHTML = res.text;

      jest.isolateModules(() => {
        global.axios = mockAxios;

        require('../../src/public/login.js');

        // Trigger the script initialization
        document.dispatchEvent(
          new Event('DOMContentLoaded', { bubbles: true }),
        );
      });

      const emailInput = screen.getByLabelText(/Correo electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('hidden');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@test.com',
          password: 'password123',
        });

        expect(window.location.href).toBe('http://localhost/');
      });
    });

    it('should show error message on failed login', async () => {
      mockAxios.post.mockRejectedValue({
        response: {
          data: { message: 'Credenciales inválidas' },
        },
      });

      const res = await request(app.getHttpServer())
        .get('/auth/login')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /text\/html/);
      document.body.innerHTML = res.text;

      jest.isolateModules(() => {
        global.axios = mockAxios;

        require('../../src/public/login.js');

        // Trigger the script initialization
        document.dispatchEvent(
          new Event('DOMContentLoaded', { bubbles: true }),
        );
      });

      const emailInput = screen.getByLabelText(/Correo electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@test.com',
          password: 'password123',
        });

        const alert = screen.getByRole('alert');
        expect(alert).not.toHaveClass('hidden');
        expect(alert).toHaveTextContent('Credenciales inválidas');
      });
    });
  });
});
