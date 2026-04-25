import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CoreAppModule } from '../../../src/app.module';
import { CommunityMemberDbEntity } from '../../../src/communities/infrastructure/persistence/entities/community-member.db-entity';
import { FundingActionAggrDbEntity } from '../../../src/funding/infrastructure/persistence/entities/funding-action-aggr.db-entity';
import {
  FundingActionApiDto,
  VolunteeringActionApiDto,
} from '../../../src/initiatives/infrastructure/presentation/dtos/action.api-dto';
import { CommunityTestFactory } from '../../communities/community.test-factory';
import { clearDatabase, waitFor } from '../../db-test-utils';
import { CauseTestFactory } from '../causes/cause.test-factory';

describe('Actions integration tests', () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  let communitiesFactory: CommunityTestFactory;
  let causesFactory: CauseTestFactory;
  let idCause: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreAppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    communitiesFactory = new CommunityTestFactory(dataSource);
    causesFactory = new CauseTestFactory(dataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);

    const community = await communitiesFactory.create({
      name: 'Community One',
      description: 'First test community',
    });

    const member = await dataSource
      .getRepository(CommunityMemberDbEntity)
      .findOneByOrFail({ communityId: community.id, admin: true });
    userId = member.userId;

    const cause = await causesFactory.create({
      title: 'Cause One',
      description: 'First test cause',
      communityId: community.id,
    });
    idCause = cause.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const buildFundingActionData = (
    overrides: Partial<FundingActionApiDto> = {},
  ): Partial<FundingActionApiDto> => {
    return {
      title: overrides.title ?? 'Action Title',
      description: overrides.description ?? 'Action Description',
      objectives: overrides.objectives ?? ['Objective 1', 'Objective 2'],
      targetAmount: overrides.targetAmount ?? 1000,
      ...overrides,
    };
  };

  const buildVolunteeringActionData = (
    overrides: Partial<VolunteeringActionApiDto> = {},
  ): Partial<VolunteeringActionApiDto> => {
    return {
      title: overrides.title ?? 'Action Title',
      description: overrides.description ?? 'Action Description',
      objectives: overrides.objectives ?? ['Objective 1', 'Objective 2'],
      start: overrides.start ?? new Date().toISOString(),
      end:
        overrides.end ??
        new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
      ...overrides,
    };
  };

  const createFundingActionAndExpectSuccess = async (
    actionData: Partial<FundingActionApiDto>,
  ) => {
    const res = await request(app.getHttpServer())
      .post(`/causes/${idCause}/actions/funding`)
      .set('x-user-id', userId)
      .send(actionData)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      title: actionData.title,
    });
    return res;
  };

  const createVolunteeringActionAndExpectSuccess = async (
    actionData: Partial<VolunteeringActionApiDto>,
  ) => {
    const res = await request(app.getHttpServer())
      .post(`/causes/${idCause}/actions/volunteering`)
      .set('x-user-id', userId)
      .send(actionData)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      title: actionData.title,
    });
    return res;
  };

  const createFundingActionAndExpectBadRequest = async (
    actionData: Partial<FundingActionApiDto>,
  ) => {
    const res = await request(app.getHttpServer())
      .post(`/causes/${idCause}/actions/funding`)
      .set('x-user-id', userId)
      .send(actionData)
      .expect(400)
      .expect('Content-Type', /json/);

    return res;
  };

  const createVolunteeringActionAndExpectBadRequest = async (
    actionData: Partial<VolunteeringActionApiDto>,
  ) => {
    const res = await request(app.getHttpServer())
      .post(`/causes/${idCause}/actions/volunteering`)
      .set('x-user-id', userId)
      .send(actionData)
      .expect(400)
      .expect('Content-Type', /json/);

    return res;
  };

  const waitForActionPersisted = async (actionId: string) => {
    await waitFor(async () => {
      const res = await request(app.getHttpServer())
        .get(`/causes/${idCause}`)
        .set('Authorization', userId);
      const actions = res.body.actions ?? [];
      return actions.some((a: { id: string }) => a.id === actionId);
    });
  };

  const waitForFundingActionProjected = async (actionId: string) => {
    await waitFor(async () => {
      const entity = await dataSource
        .getRepository(FundingActionAggrDbEntity)
        .findOneBy({ id: actionId });
      return entity !== null;
    });
  };

  it('should create a funding action successfully', async () => {
    const actionData = buildFundingActionData();
    const res = await createFundingActionAndExpectSuccess(actionData);
    await waitForActionPersisted(res.body.id as string);
    await waitForFundingActionProjected(res.body.id as string);
  });

  it('should fail to create a funding action with empty title', async () => {
    const actionData = buildFundingActionData({ title: '' });
    await createFundingActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a funding action with empty description', async () => {
    const actionData = buildFundingActionData({ description: '' });
    await createFundingActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a funding action with empty objectives', async () => {
    const actionData = buildFundingActionData({
      objectives: ['Objective 1', ''],
    });
    await createFundingActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a funding action with zero target amount', async () => {
    const actionData = buildFundingActionData({ targetAmount: 0 });
    await createFundingActionAndExpectBadRequest(actionData);
  });

  it('should create a volunteering action successfully', async () => {
    const actionData = buildVolunteeringActionData();
    const res = await createVolunteeringActionAndExpectSuccess(actionData);
    await waitForActionPersisted(res.body.id as string);
  });

  it('should fail to create a volunteering action with empty title', async () => {
    const actionData = buildVolunteeringActionData({ title: '' });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with empty description', async () => {
    const actionData = buildVolunteeringActionData({ description: '' });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with empty objectives', async () => {
    const actionData = buildVolunteeringActionData({
      objectives: ['Objective 1', ''],
    });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with empty start date', async () => {
    const actionData = buildVolunteeringActionData({ start: '' });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with empty end date', async () => {
    const actionData = buildVolunteeringActionData({ end: '' });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with invalid start date', async () => {
    const actionData = buildVolunteeringActionData({ start: 'invalid-date' });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with invalid end date', async () => {
    const actionData = buildVolunteeringActionData({ end: 'invalid-date' });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });

  it('should fail to create a volunteering action with end date before start date', async () => {
    const now = new Date();
    const pastDate = new Date(
      now.getTime() - 24 * 60 * 60 * 1000,
    ).toISOString(); // 1 day ago
    const futureDate = new Date(
      now.getTime() + 24 * 60 * 60 * 1000,
    ).toISOString(); // 1 day later

    const actionData = buildVolunteeringActionData({
      start: futureDate,
      end: pastDate,
    });
    await createVolunteeringActionAndExpectBadRequest(actionData);
  });
});
