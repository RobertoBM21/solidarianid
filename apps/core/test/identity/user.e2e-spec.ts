import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CoreAppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/identity/application/dtos/create-user.dto';
import { clearDatabase } from '../db-test-utils';

describe('Users controller (e2e)', () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreAppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper methods
  const buildUserData = (
    overrides: Partial<CreateUserDto> = {},
  ): CreateUserDto => {
    return {
      name: overrides.name ?? 'User name',
      email: overrides.email ?? `user_${crypto.randomUUID()}@example.com`,
      phone: overrides.phone ?? '12345678',
      password: overrides.password ?? 'password123',
      city: overrides.city ?? 'user city',
      country: overrides.country ?? 'us',
    };
  };

  const createUserAndExpectSuccess = async (userData: CreateUserDto) => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      userId: expect.any(String),
    });
    return res;
  };

  const createUserAndExpectBadRequest = async (userData: CreateUserDto) => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      statusCode: 400,
      message: expect.any(String),
      error: 'Bad Request',
    });
    return res;
  };

  // Black box tests

  // Test 1
  it('should create a user', async () => {
    const userData = buildUserData();
    await createUserAndExpectSuccess(userData);
  });

  // Test 2.1
  it('should not create a user with a name of length 1', async () => {
    const userData = buildUserData({ name: 'u' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 2.2
  it('should create a user with a name of length 2', async () => {
    const userData = buildUserData({ name: 'us' });
    await createUserAndExpectSuccess(userData);
  });

  // Test 2.3
  it('should create a user with a name of length 3', async () => {
    const userData = buildUserData({ name: 'use' });
    await createUserAndExpectSuccess(userData);
  });

  // Test 3.1
  it('should create a user with a name of length 99', async () => {
    const longName = 'a'.repeat(99);
    const userData = buildUserData({ name: longName });
    await createUserAndExpectSuccess(userData);
  });

  // Test 3.2
  it('should create a user with a name of length 100', async () => {
    const longName = 'a'.repeat(100);
    const userData = buildUserData({ name: longName });
    await createUserAndExpectSuccess(userData);
  });

  // Test 3.3
  it('should not create a user with a name of length 101', async () => {
    const longName = 'a'.repeat(101);
    const userData = buildUserData({ name: longName });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 4
  it('should not create a user with an empty email', async () => {
    const userData = buildUserData({ email: '' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 5
  it('should not create a user with an invalid email', async () => {
    const userData = buildUserData({ email: '%%%$]' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 6
  it('should not create a user with an empty password', async () => {
    const userData = buildUserData({ password: '' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 7
  it('should not create a user with an empty phone', async () => {
    const userData = buildUserData({ phone: '' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 8
  it('should not create a user with an invalid phone', async () => {
    const userData = buildUserData({ phone: 'abcdefg' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 9
  it('should not create a user with an empty city', async () => {
    const userData = buildUserData({ city: '' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 10.1
  it('should create a user with a city name of length 127', async () => {
    const longName = 'a'.repeat(127);
    const userData = buildUserData({ city: longName });
    await createUserAndExpectSuccess(userData);
  });

  // Test 10.2
  it('should create a user with a city name of length 128', async () => {
    const longName = 'a'.repeat(128);
    const userData = buildUserData({ city: longName });
    await createUserAndExpectSuccess(userData);
  });

  // Test 10.3
  it('should not create a user with a city name of length 129', async () => {
    const longName = 'a'.repeat(129);
    const userData = buildUserData({ city: longName });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 11.1
  it('should not create a user with country code of length 1', async () => {
    const userData = buildUserData({ country: 'e' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 11.2
  it('should create a user with country code of length 2', async () => {
    const userData = buildUserData({ country: 'es' });
    await createUserAndExpectSuccess(userData);
  });

  // Test 11.3
  it('should not create a user with country code of length 3', async () => {
    const userData = buildUserData({ country: 'esp' });
    await createUserAndExpectBadRequest(userData);
  });

  // Test 12
  it('should not create a user with an invalid country code', async () => {
    const userData = buildUserData({ country: 'xx' });
    await createUserAndExpectBadRequest(userData);
  });
});
