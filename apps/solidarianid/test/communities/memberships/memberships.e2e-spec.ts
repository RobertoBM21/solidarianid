import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module';
import { CommunityMemberDbEntity } from '../../../src/communities/infrastructure/persistence/entities/community-member.db-entity';
import { MembershipRequestDbEntity } from '../../../src/communities/infrastructure/persistence/entities/membership-request.db-entity';
import { clearDatabase, waitFor } from '../../db-test-utils';
import { UserTestFactory } from '../../identity/user.test-factory';
import { CommunityTestFactory } from '../community.test-factory';
import { CommunityMemberTestFactory } from './community-member.test-factory';

describe('Membership requests integration tests', () => {
  let app: NestExpressApplication;
  let communitiesFactory: CommunityTestFactory;
  let communitiesMembersFactory: CommunityMemberTestFactory;
  let usersFactory: UserTestFactory;
  let dataSource: DataSource;
  let idCommunity: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    communitiesFactory = new CommunityTestFactory(dataSource);
    usersFactory = new UserTestFactory(dataSource);
    communitiesMembersFactory = new CommunityMemberTestFactory(dataSource);

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

    const user = await usersFactory.create({
      name: 'Test User',
      email: 'user@example.com',
    });
    userId = user.id;

    const admin = await usersFactory.create({
      name: 'Community Admin',
      email: 'admin@example.com',
    });
    adminId = admin.id;

    // Make the admin a community admin
    await communitiesMembersFactory.create(community, admin, true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a membership request successfully', async () => {
    const res = await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      userId: userId,
      communityId: idCommunity,
      status: 'pending',
      createdAt: expect.any(String),
    });
  });

  it('should fail to create a membership request for non-existing community', async () => {
    const nonExistingCommunityId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .post(`/communities/${nonExistingCommunityId}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(404);
  });

  it('should fail to create a membership request without authentication', async () => {
    await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .send({})
      .expect(401);
  });

  it('should not allow creating duplicate membership requests', async () => {
    // First request should succeed
    await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201);

    // Second request should fail with 409 Conflict
    await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(400);
  });

  it('should fail to get all membership requests for a community when user is not admin', async () => {
    // Create a membership request
    await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201);

    // Retrieve membership requests
    const res = await request(app.getHttpServer())
      .get(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .expect(403)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      statusCode: 403,
      message: expect.any(String),
    });
  });

  it('should get all membership requests for a community when user is admin', async () => {
    // Create a membership request
    await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201);

    // Retrieve membership requests
    const res = await request(app.getHttpServer())
      .get(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', adminId)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fail to get membership requests for non-existing community', async () => {
    const nonExistingCommunityId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`/communities/${nonExistingCommunityId}/membership-requests`)
      .set('Authorization', userId)
      .expect(404);
  });

  it('should list my membership requests', async () => {
    // Create a membership request
    await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201);

    // Retrieve my membership requests
    const res = await request(app.getHttpServer())
      .get(`/membership-requests/mine`)
      .set('Authorization', userId)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      userId: userId,
      communityId: idCommunity,
      status: 'pending',
    });
  });

  it('should accept a membership request', async () => {
    // Create a membership request
    const createRes = await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201);

    const membershipRequestId = createRes.body.id as string;
    // Accept the membership request
    const acceptRes = await request(app.getHttpServer())
      .put(`/membership-requests/${membershipRequestId}`)
      .set('Authorization', adminId)
      .send({ verdict: 'accepted' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(acceptRes.body).toMatchObject({
      id: membershipRequestId,
      status: 'accepted',
    });

    // Ensure member is created before next test/closure clears DB
    await waitFor(() =>
      dataSource
        .getRepository(MembershipRequestDbEntity)
        .exists({ where: { userId, communityId: idCommunity } }),
    );

    const member = await dataSource
      .getRepository(CommunityMemberDbEntity)
      .findOneBy({ communityId: idCommunity, userId: userId });
    expect(member).toBeDefined();
  });

  it('should reject a membership request', async () => {
    // Create a membership request
    const createRes = await request(app.getHttpServer())
      .post(`/communities/${idCommunity}/membership-requests`)
      .set('Authorization', userId)
      .send({})
      .expect(201);

    const membershipRequestId = createRes.body.id as string;
    // Reject the membership request
    const rejectRes = await request(app.getHttpServer())
      .put(`/membership-requests/${membershipRequestId}`)
      .set('Authorization', adminId)
      .send({ verdict: 'rejected' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rejectRes.body).toMatchObject({
      id: membershipRequestId,
      status: 'rejected',
    });
  });
});
