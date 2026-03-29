import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { IsCommunityAdminQuery } from '../queries/is-community-admin.query';
import { IsCommunityAdminHandler } from './is-community-admin.handler';

describe('IsCommunityAdminHandler', () => {
  let handler: IsCommunityAdminHandler;

  const mockCommunityRepository = {
    isAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsCommunityAdminHandler,
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    handler = module.get<IsCommunityAdminHandler>(IsCommunityAdminHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return true if user is admin', async () => {
    mockCommunityRepository.isAdmin.mockResolvedValue(true);

    const communityId = UniqueEntityID.create();
    const userId = UniqueEntityID.create();
    const result = await handler.execute(
      new IsCommunityAdminQuery(communityId, userId),
    );

    expect(result).toBe(true);
    expect(mockCommunityRepository.isAdmin).toHaveBeenCalledWith(
      communityId,
      userId,
    );
  });

  it('Should return false if user is not admin', async () => {
    mockCommunityRepository.isAdmin.mockResolvedValue(false);

    const communityId = UniqueEntityID.create();
    const userId = UniqueEntityID.create();
    const result = await handler.execute(
      new IsCommunityAdminQuery(communityId, userId),
    );

    expect(result).toBe(false);
    expect(mockCommunityRepository.isAdmin).toHaveBeenCalledWith(
      communityId,
      userId,
    );
  });
});
