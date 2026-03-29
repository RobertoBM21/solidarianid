import { left, right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CancellationTooLateError,
  VolunteerLog,
  VolunteerLogNotOwnedError,
} from '../../domain/aggregates/volunteer-log.aggregate';
import {
  VolunteerLogNotFoundError,
  VolunteerLogRepository,
} from '../../domain/repositories/volunteer-log.repository';
import { CreateVolunteerLogDto } from '../dtos/create-volunteer-log.dto';
import { VolunteerLogService } from './volunteer-log.service';

describe('VolunteerLogService', () => {
  let service: VolunteerLogService;

  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteerLogService,
        {
          provide: VolunteerLogRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VolunteerLogService>(VolunteerLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto: CreateVolunteerLogDto = {
      volunteeringActionId: UniqueEntityID.create().toString(),
      start: new Date('2026-01-01T10:00:00Z'),
      end: new Date('2026-01-01T12:00:00Z'),
    };
    const userId = UniqueEntityID.create().toString();

    it('should register a volunteer log successfully', async () => {
      mockRepository.save.mockResolvedValue(undefined);

      const result = await service.register(dto, userId);

      expect(result.isRight()).toBe(true);
      expect(result.value).toHaveProperty('id');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should return error if date range is invalid', async () => {
      const invalidDto: CreateVolunteerLogDto = {
        volunteeringActionId: dto.volunteeringActionId,
        start: new Date('2026-01-01T12:00:00Z'),
        end: new Date('2026-01-01T10:00:00Z'),
      };

      const result = await service.register(invalidDto, userId);

      expect(result.isLeft()).toBe(true);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    const logId = UniqueEntityID.create().toString();
    const userId = UniqueEntityID.create().toString();

    it('should cancel participation successfully', async () => {
      const mockLog = VolunteerLog.create(
        {
          volunteerId: userId,
          volunteeringActionId: UniqueEntityID.create().toString(),
          start: new Date('2099-01-01T10:00:00Z'),
          end: new Date('2099-01-01T12:00:00Z'),
        },
        UniqueEntityID.create(logId),
      );

      if (mockLog.isLeft()) throw new Error('Setup failed');

      mockRepository.findById.mockResolvedValue(right(mockLog.value));
      mockRepository.remove.mockResolvedValue(right(undefined));

      const result = await service.cancel(logId, userId);

      expect(result.isRight()).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(
        expect.any(UniqueEntityID),
      );
      expect(mockRepository.remove).toHaveBeenCalledWith(
        expect.any(UniqueEntityID),
      );
    });

    it('should return NotFound if log does not exist', async () => {
      mockRepository.findById.mockResolvedValue(
        left(new VolunteerLogNotFoundError(logId)),
      );

      const result = await service.cancel(logId, userId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(VolunteerLogNotFoundError);
    });

    it('should return NotOwnedError if log belongs to another user', async () => {
      const otherUser = UniqueEntityID.create().toString();
      const mockLog = VolunteerLog.create(
        {
          volunteerId: otherUser,
          volunteeringActionId: UniqueEntityID.create().toString(),
          start: new Date('2099-01-01T10:00:00Z'),
          end: new Date('2099-01-01T12:00:00Z'),
        },
        UniqueEntityID.create(logId),
      );
      if (mockLog.isLeft()) throw new Error('Setup failed');

      mockRepository.findById.mockResolvedValue(right(mockLog.value));

      const result = await service.cancel(logId, userId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(VolunteerLogNotOwnedError);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should propagate cancellation error if it is too late', async () => {
      const mockLog = VolunteerLog.create(
        {
          volunteerId: userId,
          volunteeringActionId: UniqueEntityID.create().toString(),
          start: new Date('2020-01-01T10:00:00Z'),
          end: new Date('2020-01-01T12:00:00Z'),
        },
        UniqueEntityID.create(logId),
      );
      if (mockLog.isLeft()) throw new Error('Setup failed');

      mockRepository.findById.mockResolvedValue(right(mockLog.value));

      const result = await service.cancel(logId, userId);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CancellationTooLateError);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
