import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { IdentityAppModule } from '../src/app.module';
import { clearDatabase } from './db-test-utils';
import { UserTestFactory } from './user.test-factory';

describe('ProfileController (e2e)', () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  let userFactory: UserTestFactory;

  beforeAll(async () => {
    const mockCommunitiesService = {
      getMemberships: jest.fn().mockReturnValue(of({ memberships: [] })),
    };
    const mockClientGrpc = {
      getService: jest.fn().mockReturnValue(mockCommunitiesService),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IdentityAppModule],
    })
      .overrideProvider(GrpcPackages.Communities.Client)
      .useValue(mockClientGrpc)
      .compile();

    dataSource = moduleFixture.get(DataSource);
    userFactory = new UserTestFactory(dataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /profile', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/profile').expect(401);
    });

    it('should return 404 when the user does not exist', async () => {
      const nonExistentId = crypto.randomUUID();

      await request(app.getHttpServer())
        .get('/profile')
        .set('x-user-id', nonExistentId)
        .expect(404);
    });

    it('should return the user profile', async () => {
      const user = await userFactory.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '600000001',
        city: 'Madrid',
        country: 'es',
      });

      const res = await request(app.getHttpServer())
        .get('/profile')
        .set('x-user-id', user.id)
        .expect(200);

      expect(res.body).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        country: user.country,
      });
    });
  });

  describe('PUT /profile', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .put('/profile')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should return 404 when the user does not exist', async () => {
      const nonExistentId = crypto.randomUUID();

      await request(app.getHttpServer())
        .put('/profile')
        .set('x-user-id', nonExistentId)
        .send({ name: 'New Name' })
        .expect(404);
    });

    it('should update the profile name', async () => {
      const user = await userFactory.create({ name: 'Old Name' });

      const res = await request(app.getHttpServer())
        .put('/profile')
        .set('x-user-id', user.id)
        .send({ name: 'New Name' })
        .expect(200);

      expect(res.body).toMatchObject({
        id: user.id,
        name: 'New Name',
      });
    });

    it('should update multiple profile fields at once', async () => {
      const user = await userFactory.create();

      const res = await request(app.getHttpServer())
        .put('/profile')
        .set('x-user-id', user.id)
        .send({ name: 'Updated Name', phone: '987654321', city: 'Barcelona' })
        .expect(200);

      expect(res.body).toMatchObject({
        id: user.id,
        name: 'Updated Name',
        phone: '987654321',
        city: 'Barcelona',
      });
    });

    it('should return 400 for an invalid country code', async () => {
      const user = await userFactory.create();

      await request(app.getHttpServer())
        .put('/profile')
        .set('x-user-id', user.id)
        .send({ country: 'INVALID' })
        .expect(400);
    });
  });
});
