import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { CommunityMemberDbEntity } from '../../../src/communities/infrastructure/persistence/entities/community-member.db-entity';
import { CommunityTestFactory } from '../../communities/community.test-factory';
import { clearDatabase } from '../../db-test-utils';

interface CreateCauseData {
  title: string;
  description: string;
  duration: string;
  ods: number;
}

describe('Causes integration tests', () => {
  let app: NestExpressApplication;
  let communitiesFactory: CommunityTestFactory;
  let dataSource: DataSource;
  let idCommunity: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    communitiesFactory = new CommunityTestFactory(dataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
    const community = await communitiesFactory.create({
      name: 'Community One',
      description: 'First test community',
    });
    idCommunity = community.id;

    const member = await dataSource
      .getRepository(CommunityMemberDbEntity)
      .findOneByOrFail({ communityId: idCommunity, admin: true });
    userId = member.userId;
  });

  afterAll(async () => {
    await app.close();
  });

  const buildCauseData = (overrides: Partial<CreateCauseData> = {}) => {
    return {
      title: overrides.title ?? 'Cause Title',
      description: overrides.description ?? 'Cause Description',
      duration: overrides.duration ?? '3 months',
      ods: overrides.ods ?? 3,
      ...overrides,
    };
  };

  const createCauseAndExpectSuccess = async (causeData: CreateCauseData) => {
    const res = await request(app.getHttpServer())
      .post('/communities/' + idCommunity + '/causes')
      .set('Authorization', userId)
      .send(causeData)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      causeId: expect.any(String),
    });
    return res;
  };

  const createCauseAndExpectBadRequest = async (causeData: CreateCauseData) => {
    const res = await request(app.getHttpServer())
      .post('/communities/' + idCommunity + '/causes')
      .set('Authorization', userId)
      .send(causeData)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      statusCode: 400,
      message: expect.any(String),
      error: 'Bad Request',
    });
    return res;
  };

  it('should create a cause successfully', async () => {
    const causeData = buildCauseData();
    await createCauseAndExpectSuccess(causeData);
  });

  it('should fail to create a cause with empty title', async () => {
    const causeData = buildCauseData({ title: '' });
    await createCauseAndExpectBadRequest(causeData);
  });

  it('should fail to create a cause with empty description', async () => {
    const causeData = buildCauseData({ description: '' });
    await createCauseAndExpectBadRequest(causeData);
  });

  it('should fail to create a cause with invalid ODS', async () => {
    const causeData = buildCauseData({ ods: 20 });
    await createCauseAndExpectBadRequest(causeData);
  });

  it('should fail to create a cause with empty duration', async () => {
    const causeData = buildCauseData({ duration: '' });
    await createCauseAndExpectBadRequest(causeData);
  });

  it('should get all causes for a community successfully', async () => {
    const causeData1 = buildCauseData({ title: 'Cause One' });
    const causeData2 = buildCauseData({ title: 'Cause Two' });

    await createCauseAndExpectSuccess(causeData1);
    await createCauseAndExpectSuccess(causeData2);

    const res = await request(app.getHttpServer())
      .get('/communities/' + idCommunity + '/causes')
      .set('Authorization', userId)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveLength(2);
    const titles = res.body.map((c: any) => c.title).sort();
    expect(titles).toEqual(['Cause One', 'Cause Two']);
  });

  it('should get a cause by ID successfully', async () => {
    const causeData = buildCauseData({ title: 'Specific Cause' });
    const createRes = await createCauseAndExpectSuccess(causeData);
    const causeId = createRes.body.causeId as string;

    const res = await request(app.getHttpServer())
      .get(`/causes/${causeId}`)
      .set('Authorization', userId)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({ title: 'Specific Cause' });
  });

  it('should close a cause successfully', async () => {
    const causeData = buildCauseData({ title: 'Closable Cause' });
    const createRes = await createCauseAndExpectSuccess(causeData);
    const causeId = createRes.body.causeId as string;

    await request(app.getHttpServer())
      .post(`/causes/${causeId}/close`)
      .set('Authorization', userId)
      .expect(200);

    const getRes = await request(app.getHttpServer())
      .get(`/causes/${causeId}`)
      .set('Authorization', userId)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(getRes.body).toMatchObject({ closed: true });
  });

  it('should fail to close a cause without authentication', async () => {
    const causeData = buildCauseData({ title: 'Non-Closable Cause' });
    const createRes = await createCauseAndExpectSuccess(causeData);
    const causeId = createRes.body.causeId as string;

    await request(app.getHttpServer())
      .post(`/causes/${causeId}/close`)
      .expect(401);
  });

  it('should fail to close a non-existing cause', async () => {
    const nonExistingCauseId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .post(`/causes/${nonExistingCauseId}/close`)
      .set('Authorization', userId)
      .expect(404);
  });
});
