import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CommunityDbEntity } from '../src/infrastructure/persistence/entities/community.db-entity';
import { AppModule } from './../src/app.module';

describe('CommunitiesController (e2e)', () => {
  let ormRepo: Repository<CommunityDbEntity>;
  let app: NestExpressApplication;

  const predefinedCommunities = [
    {
      id: v4(),
      name: 'Community One',
      description: 'The first community',
      createdAt: new Date(),
    },
    {
      id: v4(),
      name: 'Community Two',
      description: 'The second community',
      createdAt: new Date(),
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    ormRepo = moduleFixture.get(EntityManager).getRepository(CommunityDbEntity);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await ormRepo.clear();
    await ormRepo.insert(predefinedCommunities);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/communities (GET) should return all communities', async () => {
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
            ...c,
            createdAt: c.createdAt.toISOString(),
          }),
        ),
      ),
    );
  });
});
