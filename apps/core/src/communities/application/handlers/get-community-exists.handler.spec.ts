import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { GetCommunityExistsQuery } from '../queries/get-community-exists.query';
import { GetCommunityExistsHandler } from './get-community-exists.handler';

describe('GetCommunityExistsHandler', () => {
  let handler: GetCommunityExistsHandler;

  const mockCommunityRepository = {
    exists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCommunityExistsHandler,
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    handler = module.get<GetCommunityExistsHandler>(GetCommunityExistsHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if community exists', async () => {
    mockCommunityRepository.exists.mockResolvedValue(true);

    const communityId = UniqueEntityID.create();
    const result = await handler.execute(
      new GetCommunityExistsQuery(communityId),
    );

    expect(result).toBe(true);
    expect(mockCommunityRepository.exists).toHaveBeenCalledWith(communityId);
  });

  it('should return false if community does not exist', async () => {
    mockCommunityRepository.exists.mockResolvedValue(false);

    const communityId = UniqueEntityID.create();
    const result = await handler.execute(
      new GetCommunityExistsQuery(communityId),
    );

    expect(result).toBe(false);
    expect(mockCommunityRepository.exists).toHaveBeenCalledWith(communityId);
  });
});
