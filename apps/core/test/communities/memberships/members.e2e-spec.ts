import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CoreAppModule } from '../../../src/app.module';
import { CommunityMemberDbEntity } from '../../../src/communities/infrastructure/persistence/entities/community-member.db-entity';
import { clearDatabase } from '../../db-test-utils';
import { UserTestFactory } from '../../identity/user.test-factory';
import { CommunityTestFactory } from '../community.test-factory';
import { CommunityMemberTestFactory } from './community-member.test-factory';

describe('Community members integration tests', () => {
  let app: NestExpressApplication;
  let usersFactory: UserTestFactory;
  let communitiesFactory: CommunityTestFactory;
  let communitiesMembersFactory: CommunityMemberTestFactory;
  let dataSource: DataSource;
  let idCommunity: string;
  let userId: string;
  let adminId: string;
  let userMemberId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreAppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    usersFactory = new UserTestFactory(dataSource);
    communitiesFactory = new CommunityTestFactory(dataSource);
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
    // Make the user a regular community member
    const userMember = await communitiesMembersFactory.create(
      community,
      user,
      false,
    );
    userMemberId = userMember.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should retrieve community members', async () => {
    const res = await request(app.getHttpServer())
      .get(`/communities/${idCommunity}/members`)
      .set('x-user-id', adminId)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    const member = res.body.find((m: any) => m.userId === userId);
    expect(member).toBeDefined();
    expect(member.userId).toBe(userId);
  });

  it('should fail to retrieve community members without authorization', async () => {
    await request(app.getHttpServer())
      .get(`/communities/${idCommunity}/members`)
      .expect(401);
  });

  it('should fail to retrieve community members for non-existing community', async () => {
    const nonExistingCommunityId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`/communities/${nonExistingCommunityId}/members`)
      .set('x-user-id', adminId)
      .expect(404);
  });

  it('should promote a member to admin', async () => {
    await request(app.getHttpServer())
      .post(`/community-members/${userMemberId}/promote`)
      .set('x-user-id', adminId)
      .expect(200);
  });

  it('should fail to promote a member to admin without authorization', async () => {
    await request(app.getHttpServer())
      .post(`/community-members/${userMemberId}/promote`)
      .expect(401);
  });

  it('should fail to promote a non-existing member', async () => {
    const nonExistingMemberId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .post(`/community-members/${nonExistingMemberId}/promote`)
      .set('x-user-id', adminId)
      .expect(404);
  });

  it('should expel a member from the community', async () => {
    await request(app.getHttpServer())
      .delete(`/community-members/${userMemberId}`)
      .set('x-user-id', adminId)
      .expect(200);

    const expelledMember = await dataSource
      .getRepository(CommunityMemberDbEntity)
      .findOneBy({
        communityId: idCommunity,
        userId: userId,
      });
    expect(expelledMember).toBeNull();
  });

  it('should fail to expel a member without authorization', async () => {
    await request(app.getHttpServer())
      .delete(`/community-members/${userMemberId}`)
      .expect(401);
  });

  it('should fail to expel a non-existing member', async () => {
    const nonExistingMemberId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .delete(`/community-members/${nonExistingMemberId}`)
      .set('x-user-id', userId)
      .expect(404);
  });
});
