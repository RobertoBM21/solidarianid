import { InvalidCommunityNameError } from '@app/shared/domain/value-objects/community-name.vo';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import {
  Community,
  CommunityNameAlreadyExistsError,
} from '../../domain/community.aggregate';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CreateCommunityService } from './create-community.service';

describe('CreateCommunityService', () => {
  let service: CreateCommunityService;

  const mockCommunityRepository = {
    exists: jest.fn(),
    existsByName: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommunityService,
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CreateCommunityService>(CreateCommunityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a community', async () => {
    mockCommunityRepository.existsByName.mockResolvedValue(false);

    const adminId = v4();
    const result = await service.createCommunity({
      name: 'New Community',
      description: 'A description',
      adminId,
    });

    expect(result.isRight()).toBe(true);
    expect(mockCommunityRepository.save).toHaveBeenCalledWith(
      expect.any(Community),
    );
  });

  it('should not create a community with an existing name', async () => {
    mockCommunityRepository.existsByName.mockResolvedValue(true);
    const name = 'Existing Community';

    const result = await service.createCommunity({
      name,
      description: 'A description',
      adminId: v4(),
    });

    expect(mockCommunityRepository.existsByName).toHaveBeenCalledWith(name);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CommunityNameAlreadyExistsError);
    }
    expect(mockCommunityRepository.save).not.toHaveBeenCalled();
  });

  it('should not create a community with invalid data', async () => {
    mockCommunityRepository.existsByName.mockResolvedValue(false);

    const result = await service.createCommunity({
      name: '', // Invalid name
      description: 'A description',
      adminId: v4(),
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCommunityNameError);
    }
    expect(mockCommunityRepository.save).not.toHaveBeenCalled();
  });
});
