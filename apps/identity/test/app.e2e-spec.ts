import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import request from 'supertest';
import { IdentityAppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const mockCommunitiesService = {
      getMemberships: jest.fn().mockReturnValue(of({ memberships: [] })),
    };
    const mockClientGrpc = {
      getService: jest.fn().mockReturnValue(mockCommunitiesService),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IdentityAppModule],
    })
      .overrideProvider(GrpcPackages.Communities.Client)
      .useValue(mockClientGrpc)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Really a smoke test
  it('/ (GET) should return something', () => {
    return request(app.getHttpServer()).get('/').expect(HttpStatus.NOT_FOUND);
  });
});
