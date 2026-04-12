import { left, right, UniqueEntityID } from '@app/shared/domain';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import request from 'supertest';
import {
  CauseDto,
  CommunityOutDto,
} from '../../src/communities/application/dtos/community-out.dto';
import { CommunitiesPort } from '../../src/communities/application/ports/communities.port';
import { CommunitiesResolver } from '../../src/communities/infrastructure/presentation/graphql/communities.resolver';
import { AuthMiddleware } from '../../src/identity/infrastructure/middlewares/auth.middleware';
import {
  AlreadySupportingError,
  CauseSupportsPort,
} from '../../src/initiatives/application/ports/cause-supports.port';
import { CauseNotFoundError } from '../../src/initiatives/domain/repositories/cause-aggr.repository';
import { causeSupportPubSubProvider } from '../../src/initiatives/infrastructure/graphql/pubsub.provider';
import { CauseSupportsResolver } from '../../src/initiatives/infrastructure/presentation/graphql/cause-supports.resolver';

const CAUSE_ID = UniqueEntityID.create().toString();
const COMMUNITY_ID = UniqueEntityID.create().toString();
const USER_ID = UniqueEntityID.create().toString();

function stubCauseDto(overrides?: Partial<CauseDto>): CauseDto {
  return {
    id: CAUSE_ID,
    title: 'Test Cause',
    description: 'A test cause',
    duration: '3 months',
    ods: 2,
    closed: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function stubCommunityDto(
  overrides?: Partial<CommunityOutDto>,
): CommunityOutDto {
  return {
    id: COMMUNITY_ID,
    name: 'Test Community',
    description: 'A test community',
    createdAt: '2025-01-01T00:00:00.000Z',
    causes: [stubCauseDto()],
    ...overrides,
  };
}

const listCommunities = jest.fn();
const getCommunity = jest.fn();
const registerSupportForUser = jest.fn();

@Module({})
class AuthMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}

describe('GraphQL resolvers', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'apps/core/src/schema.gql'),
          subscriptions: { 'graphql-ws': true },
        }),
        AuthMiddlewareModule,
      ],
      providers: [
        CommunitiesResolver,
        {
          provide: CommunitiesPort,
          useValue: { listCommunities, getCommunity },
        },
        CauseSupportsResolver,
        {
          provide: CauseSupportsPort,
          useValue: { registerSupportForUser },
        },
        causeSupportPubSubProvider,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    listCommunities.mockResolvedValue([stubCommunityDto()]);
    getCommunity.mockResolvedValue(right(stubCommunityDto()));
    registerSupportForUser.mockResolvedValue(right(undefined));
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

    it('should return communities with nested causes', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: COMMUNITIES_QUERY })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.communities).toHaveLength(1);

      const community = res.body.data.communities[0];
      expect(community).toEqual(
        expect.objectContaining({
          id: COMMUNITY_ID,
          name: 'Test Community',
        }),
      );
      expect(community.causes[0]).toEqual(
        expect.objectContaining({
          id: CAUSE_ID,
          title: 'Test Cause',
          status: false,
        }),
      );
    });

    it('should forward search and sort arguments to the port', async () => {
      const query = `
        query {
          communities(search: "test", sortField: "name", sortOrder: "ASC") {
            id
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(listCommunities).toHaveBeenCalledWith('test', {
        field: 'name',
        order: 'ASC',
      });
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
        .send({ query: COMMUNITY_QUERY, variables: { id: COMMUNITY_ID } })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.community.id).toBe(COMMUNITY_ID);
      expect(res.body.data.community.causes).toHaveLength(1);
    });

    it('should return a GraphQL error when community is not found', async () => {
      const unknownId = UniqueEntityID.create().toString();
      getCommunity.mockResolvedValue(left({ message: 'Community not found' }));

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: COMMUNITY_QUERY,
          variables: { id: unknownId },
        })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe('Community not found');
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
        .set('Authorization', USER_ID)
        .send({ query: REGISTER_SUPPORT, variables: { causeId: CAUSE_ID } })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.registerCauseSupport).toBe(true);
      expect(registerSupportForUser).toHaveBeenCalledWith({
        causeId: CAUSE_ID,
        userId: USER_ID,
      });
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: REGISTER_SUPPORT, variables: { causeId: CAUSE_ID } });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain(
        'Authorization header must be a valid UUID',
      );
    });

    it('should return a GraphQL error when cause is not found', async () => {
      registerSupportForUser.mockResolvedValue(
        left(new CauseNotFoundError(CAUSE_ID)),
      );

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', USER_ID)
        .send({ query: REGISTER_SUPPORT, variables: { causeId: CAUSE_ID } })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('not found');
    });

    it('should return a GraphQL error when user already supports the cause', async () => {
      registerSupportForUser.mockResolvedValue(
        left(new AlreadySupportingError()),
      );

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', USER_ID)
        .send({ query: REGISTER_SUPPORT, variables: { causeId: CAUSE_ID } })
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

    it('should expose causeId, userId and registeredAt fields on the result type', async () => {
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
        expect.arrayContaining(['causeId', 'userId', 'registeredAt']),
      );
    });
  });
});
