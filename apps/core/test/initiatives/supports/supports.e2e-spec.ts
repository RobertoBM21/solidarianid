import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CoreAppModule } from '../../../src/app.module';
import { CauseSupportDbEntity } from '../../../src/initiatives/infrastructure/persistence/entities/cause-support.db-entity';
import { CommunityTestFactory } from '../../communities/community.test-factory';
import { clearDatabase, waitFor } from '../../db-test-utils';
import { CauseTestFactory } from '../causes/cause.test-factory';

describe('Supports integration tests', () => {
  let app: NestExpressApplication;
  let causeTestFactory: CauseTestFactory;
  let communityTestFactory: CommunityTestFactory;
  let dataSource: DataSource;
  let userId: string;
  let causeId: string;

  beforeAll(async () => {
    const mockIdentityService = {
      getUser: jest
        .fn()
        .mockImplementation(({ userId }: { userId: string }) =>
          of({ id: userId, name: 'Test User', email: `${userId}@test.com` }),
        ),
      listUsers: jest.fn().mockReturnValue(of({ users: [], totalPages: 0 })),
    };
    const mockClientGrpc = {
      getService: jest.fn().mockReturnValue(mockIdentityService),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreAppModule],
    })
      .overrideProvider(GrpcPackages.Identity.Client)
      .useValue(mockClientGrpc)
      .compile();

    dataSource = moduleFixture.get(DataSource);
    causeTestFactory = new CauseTestFactory(dataSource);
    communityTestFactory = new CommunityTestFactory(dataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
    userId = crypto.randomUUID();

    const community = await communityTestFactory.create({
      name: 'Test Community',
    });

    const cause = await causeTestFactory.create({
      title: 'Test Cause',
      description: 'A cause for testing',
      communityId: community.id,
    });
    causeId = cause.id;
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

  const waitForUserSupportPersisted = async () => {
    await waitFor(async () => {
      const res = await request(app.getHttpServer())
        .get(`/causes/${causeId}`)
        .set('x-user-id', userId);
      return res.body.supportedByUser === true;
    });
  };

  const waitForAnonymousSupportPersisted = async () => {
    await waitFor(async () => {
      const count = await dataSource
        .getRepository(CauseSupportDbEntity)
        .countBy({ causeId: causeId });
      return count > 0;
    });
  };

  it('should create a user support successfully', async () => {
    await request(app.getHttpServer())
      .post(`/causes/${causeId}/supports`)
      .set('x-user-id', userId)
      .send({})
      .expect(201);
    await waitForUserSupportPersisted();
  });

  it('should create an anonymous support successfully', async () => {
    const supportData = buildAnonymousSupportData({});
    await request(app.getHttpServer())
      .post(`/causes/${causeId}/supports/create-anonymous`)
      .send(supportData)
      .expect(201);
    await waitForAnonymousSupportPersisted();
  });

  it('should fail to create a user support without authentication', async () => {
    await request(app.getHttpServer())
      .post(`/causes/${causeId}/supports`)
      .send({})
      .expect(401);
  });

  it('should fail to create a user support for non-existing cause', async () => {
    const nonExistingCauseId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .post(`/causes/${nonExistingCauseId}/supports`)
      .set('x-user-id', userId)
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
