import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseSupportRepository } from '../../domain/repositories/cause-support.repository';
import { IsCauseSupportedByUserQuery } from '../queries/is-cause-supported-by-user.query';
import { IsCauseSupportedByUserHandler } from './is-cause-supported-by-user.handler';

describe('IsCauseSupportedByUserHandler', () => {
  let handler: IsCauseSupportedByUserHandler;

  const mockCauseSupportRepository = {
    existsForSupporterAndCause: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsCauseSupportedByUserHandler,
        {
          provide: CauseSupportRepository,
          useValue: mockCauseSupportRepository,
        },
      ],
    }).compile();

    handler = module.get(IsCauseSupportedByUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when support exists', async () => {
    mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
      true,
    );

    const result = await handler.execute(
      new IsCauseSupportedByUserQuery(
        UniqueEntityID.create(),
        UniqueEntityID.create(),
      ),
    );

    expect(result).toBe(true);
  });

  it('should return false when support does not exist', async () => {
    mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
      false,
    );

    const result = await handler.execute(
      new IsCauseSupportedByUserQuery(
        UniqueEntityID.create(),
        UniqueEntityID.create(),
      ),
    );

    expect(result).toBe(false);
  });
});
