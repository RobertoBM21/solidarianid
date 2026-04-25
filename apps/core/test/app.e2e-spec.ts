import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import request from 'supertest';
import { CoreAppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: NestExpressApplication;

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
