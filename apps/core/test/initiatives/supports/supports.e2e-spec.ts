import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CoreAppModule } from '../../../src/app.module';
import { CommunityTestFactory } from '../../communities/community.test-factory';
import { clearDatabase } from '../../db-test-utils';
import { UserTestFactory } from '../../identity/user.test-factory';
import { CauseTestFactory } from '../causes/cause.test-factory';

describe('Supports integration tests', () => {
  let app: NestExpressApplication;
  let userTestFactory: UserTestFactory;
  let causeTestFactory: CauseTestFactory;
  let communityTestFactory: CommunityTestFactory;
  let dataSource: DataSource;
  let idUser: string;
  let idCause: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreAppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    userTestFactory = new UserTestFactory(dataSource);
    causeTestFactory = new CauseTestFactory(dataSource);
    communityTestFactory = new CommunityTestFactory(dataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
    const user = await userTestFactory.create({
      name: 'Test User',
      email: 'user@example.com',
    });
    idUser = user.id;

    const community = await communityTestFactory.create({
      name: 'Test Community',
    });

    const cause = await causeTestFactory.create({
      title: 'Test Cause',
      description: 'A cause for testing',
      communityId: community.id,
    });
    idCause = cause.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const buildAnonymousSupportData = (
    overrides: Partial<{ name: string; email: string }>,
  ) => {
    return {
      name: overrides.name ?? 'Anonymous Supporter',
      email: overrides.email ?? 'anonymous@example.com',
      ...overrides,
    };
  };

  it('should create a user support successfully', async () => {
    await request(app.getHttpServer())
      .post(`/causes/${idCause}/supports`)
      .set('Authorization', idUser)
      .send({})
      .expect(201);
  });

  it('should create an anonymous support successfully', async () => {
    const supportData = buildAnonymousSupportData({});
    await request(app.getHttpServer())
      .post(`/causes/${idCause}/supports/create-anonymous`)
      .send(supportData)
      .expect(201);
  });

  it('should fail to create a user support without authentication', async () => {
    await request(app.getHttpServer())
      .post(`/causes/${idCause}/supports`)
      .send({})
      .expect(401);
  });

  it('should fail to create a user support for non-existing cause', async () => {
    const nonExistingCauseId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .post(`/causes/${nonExistingCauseId}/supports`)
      .set('Authorization', idUser)
      .send({})
      .expect(404);
  });

  it('should fail to create an anonymous support for non-existing cause', async () => {
    const nonExistingCauseId = '00000000-0000-0000-0000-000000000000';
    const supportData = buildAnonymousSupportData({});
    await request(app.getHttpServer())
      .post(`/causes/${nonExistingCauseId}/supports/create-anonymous`)
      .send(supportData)
      .expect(404);
  });
});
