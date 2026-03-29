import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { clearDatabase } from '../db-test-utils';
import { CommunityTestFactory } from './community.test-factory';

describe('CommunitiesController (e2e)', () => {
  let dataSource: DataSource;
  let communitiesFactory: CommunityTestFactory;
  let app: NestExpressApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/communities (GET) should return all communities', async () => {
    const predefinedCommunities = [
      await communitiesFactory.create({
        name: 'Community One',
        description: 'First test community',
      }),
      await communitiesFactory.create({
        name: 'Community Two',
        description: 'Second test community',
      }),
    ];

    const res = await request(app.getHttpServer())
      .get('/communities')
      .expect(HttpStatus.OK)
      .expect('Content-Type', /json/);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body).toHaveLength(predefinedCommunities.length);
    expect(res.body).toEqual(
      expect.arrayContaining(
        predefinedCommunities.map((c) =>
          expect.objectContaining({
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt.toISOString(),
          }),
        ),
      ),
    );
  });
});
