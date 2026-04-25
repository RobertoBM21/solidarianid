import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CoreAppModule } from '../../src/app.module';
import { CauseSupportDbEntity } from '../../src/initiatives/infrastructure/persistence/entities/cause-support.db-entity';
import { CommunityTestFactory } from '../communities/community.test-factory';
import { clearDatabase, waitFor } from '../db-test-utils';
import { CauseTestFactory } from '../initiatives/causes/cause.test-factory';

describe('GraphQL resolvers (integration)', () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  let communityTestFactory: CommunityTestFactory;
  let causeTestFactory: CauseTestFactory;

  let userId: string;
  let communityId: string;
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
    communityTestFactory = new CommunityTestFactory(dataSource);
    causeTestFactory = new CauseTestFactory(dataSource);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);

    userId = crypto.randomUUID();

    const community = await communityTestFactory.create({
      name: 'Test Community',
      description: 'A test community',
    });
    communityId = community.id;

    const cause = await causeTestFactory.create({
      title: 'Test Cause',
      description: 'A test cause',
      communityId,
    });
    causeId = cause.id;
  });

  const waitForSupportPersisted = () =>
    waitFor(async () => {
      const count = await dataSource
        .getRepository(CauseSupportDbEntity)
        .countBy({ causeId });
      return count > 0;
    });

  describe('Query: communities', () => {
    const COMMUNITIES_QUERY = `
      query {
        communities {
          id name description createdAt
          causes { id title description duration ods status createdAt }
        }
      }
    `;

    it('should return seeded communities with nested causes', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: COMMUNITIES_QUERY })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.communities).toHaveLength(1);

      const community = res.body.data.communities[0];
      expect(community.id).toBe(communityId);
      expect(community.name).toBe('Test Community');

      expect(community.causes).toHaveLength(1);
      expect(community.causes[0].id).toBe(causeId);
      expect(community.causes[0].title).toBe('Test Cause');
      expect(typeof community.causes[0].status).toBe('boolean');
    });
  });

  describe('Query: community', () => {
    const COMMUNITY_QUERY = `
      query($id: String!) {
        community(id: $id) {
          id name description createdAt
          causes { id title status }
        }
      }
    `;

    it('should return a single community by ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: COMMUNITY_QUERY, variables: { id: communityId } })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.community.id).toBe(communityId);
      expect(res.body.data.community.causes).toHaveLength(1);
    });

    it('should return a GraphQL error when community is not found', async () => {
      const unknownId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: COMMUNITY_QUERY, variables: { id: unknownId } })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('not found');
    });
  });

  describe('Mutation: registerCauseSupport', () => {
    const REGISTER_SUPPORT = `
      mutation($causeId: String!) {
        registerCauseSupport(causeId: $causeId)
      }
    `;

    it('should register support when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('x-user-id', userId)
        .send({ query: REGISTER_SUPPORT, variables: { causeId } })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.registerCauseSupport).toBe(true);

      await waitForSupportPersisted();
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: REGISTER_SUPPORT, variables: { causeId } });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain(
        'Authorization header must be a valid UUID',
      );
    });

    it('should return a GraphQL error when cause is not found', async () => {
      const unknownCauseId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('x-user-id', userId)
        .send({
          query: REGISTER_SUPPORT,
          variables: { causeId: unknownCauseId },
        })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('not found');
    });

    it('should return a GraphQL error when user already supports the cause', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .set('x-user-id', userId)
        .send({ query: REGISTER_SUPPORT, variables: { causeId } })
        .expect(200);

      await waitForSupportPersisted();

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('x-user-id', userId)
        .send({ query: REGISTER_SUPPORT, variables: { causeId } })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain(
        'Support already registered',
      );
    });
  });

  describe('Subscription: causeSupportRegistered', () => {
    it('should expose the subscription field in the schema', async () => {
      const introspection = `
        {
          __schema {
            subscriptionType {
              fields { name }
            }
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: introspection })
        .expect(200);

      const fields = res.body.data.__schema.subscriptionType.fields;
      expect(fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'causeSupportRegistered' }),
        ]),
      );
    });

    it('should accept an optional causeId argument', async () => {
      const introspection = `
        {
          __type(name: "Subscription") {
            fields {
              name
              args { name type { kind name ofType { name } } }
            }
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: introspection })
        .expect(200);

      const sub = res.body.data.__type.fields.find(
        (f: { name: string }) => f.name === 'causeSupportRegistered',
      );
      expect(sub.args).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'causeId' })]),
      );
      const causeIdArg = sub.args.find(
        (a: { name: string }) => a.name === 'causeId',
      );
      expect(causeIdArg.type.kind).toBe('SCALAR');
    });

    it('should expose userName, userId and registeredAt fields on the result type', async () => {
      const introspection = `
        {
          __type(name: "CauseSupportResultType") {
            fields { name }
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: introspection })
        .expect(200);

      const fieldNames = res.body.data.__type.fields.map(
        (f: { name: string }) => f.name,
      );
      expect(fieldNames).toEqual(
        expect.arrayContaining(['userName', 'userId', 'registeredAt']),
      );
    });
  });
});
