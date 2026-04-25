import { left, right, UniqueEntityID } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AlreadySupportingError,
  CauseSupportsPort,
} from '../../../application/ports/cause-supports.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';
import { CAUSE_SUPPORT_PUBSUB } from '../../graphql/pubsub.provider';
import { CauseSupportsResolver } from './cause-supports.resolver';

describe('CauseSupportsResolver', () => {
  let resolver: CauseSupportsResolver;

  const causeId = UniqueEntityID.create().toString();
  const userId = UniqueEntityID.create().toString();

  const supportDto = {
    supporterId: userId,
    supporterName: 'Test User',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  const mockPort = {
    registerSupportForUser: jest.fn(),
  };

  const mockPubSub = {
    publish: jest.fn().mockResolvedValue(undefined),
    asyncIterableIterator: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseSupportsResolver,
        { provide: CauseSupportsPort, useValue: mockPort },
        { provide: CAUSE_SUPPORT_PUBSUB, useValue: mockPubSub },
      ],
    }).compile();

    resolver = module.get(CauseSupportsResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerCauseSupport()', () => {
    it('should return true on successful support registration', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(right(supportDto));

      const result = await resolver.registerCauseSupport(causeId, userId);

      expect(result).toBe(true);
    });

    it('should call the port with causeId and userId', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(right(supportDto));

      await resolver.registerCauseSupport(causeId, userId);

      expect(mockPort.registerSupportForUser).toHaveBeenCalledWith({
        causeId,
        userId,
      });
    });

    it('should publish to the global causeSupportRegistered topic on success', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(right(supportDto));

      await resolver.registerCauseSupport(causeId, userId);

      expect(mockPubSub.publish).toHaveBeenCalledWith(
        'causeSupportRegistered',
        expect.objectContaining({
          causeSupportRegistered: expect.any(Object),
        }),
      );
    });

    it('should publish to the cause-specific topic on success', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(right(supportDto));

      await resolver.registerCauseSupport(causeId, userId);

      expect(mockPubSub.publish).toHaveBeenCalledWith(
        `causeSupportRegistered.${causeId}`,
        expect.objectContaining({
          causeSupportRegistered: expect.any(Object),
        }),
      );
    });

    it('should publish the correct payload shape', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(right(supportDto));

      await resolver.registerCauseSupport(causeId, userId);

      expect(mockPubSub.publish).toHaveBeenCalledWith(
        'causeSupportRegistered',
        {
          causeSupportRegistered: {
            userName: supportDto.supporterName,
            userId: supportDto.supporterId,
            registeredAt: supportDto.createdAt.toISOString(),
          },
        },
      );
    });

    it('should throw NotFoundException for CauseNotFoundError', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        resolver.registerCauseSupport(causeId, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException for AlreadySupportingError', async () => {
      mockPort.registerSupportForUser.mockResolvedValue(
        left(new AlreadySupportingError()),
      );

      await expect(
        resolver.registerCauseSupport(causeId, userId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('causeSupportRegistered()', () => {
    it('should subscribe to the global topic when no causeId is provided', () => {
      resolver.causeSupportRegistered();

      expect(mockPubSub.asyncIterableIterator).toHaveBeenCalledWith(
        'causeSupportRegistered',
      );
    });

    it('should subscribe to the cause-specific topic when causeId is provided', () => {
      resolver.causeSupportRegistered(causeId);

      expect(mockPubSub.asyncIterableIterator).toHaveBeenCalledWith(
        `causeSupportRegistered.${causeId}`,
      );
    });
  });
});
