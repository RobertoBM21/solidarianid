import { Test, TestingModule } from '@nestjs/testing';
import { UsersPort } from '../../../application/ports/users.port';
import { ReportsController } from './reports.controller';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockUsersPort = {
    listUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersPort,
          useValue: mockUsersPort,
        },
      ],
      controllers: [ReportsController],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
