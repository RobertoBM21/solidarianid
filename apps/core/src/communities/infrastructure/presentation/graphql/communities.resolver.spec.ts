/* eslint-disable @typescript-eslint/no-misused-spread */
import { left, right, UniqueEntityID } from '@app/shared/domain';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CauseDto,
  CommunityOutDto,
} from '../../../application/dtos/community-out.dto';
import { CommunitiesPort } from '../../../application/ports/communities.port';
import { CommunitiesResolver } from './communities.resolver';

describe('CommunitiesResolver', () => {
  let resolver: CommunitiesResolver;

  const CAUSE_ID = UniqueEntityID.create().toString();
  const COMMUNITY_ID = UniqueEntityID.create().toString();

  const causeDto: CauseDto = {
    id: CAUSE_ID,
    title: 'Test Cause',
    description: 'A test cause',
    duration: '3 months',
    ods: 2,
    closed: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  } as CauseDto;

  const communityDto: CommunityOutDto = {
    id: COMMUNITY_ID,
    name: 'Test Community',
    description: 'A test community',
    createdAt: '2025-01-01T00:00:00.000Z',
    causes: [causeDto],
  } as CommunityOutDto;

  const mockPort = {
    listCommunities: jest.fn(),
    getCommunity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesResolver,
        { provide: CommunitiesPort, useValue: mockPort },
      ],
    }).compile();

    resolver = module.get(CommunitiesResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('communities()', () => {
    it('should return a mapped list of communities', async () => {
      mockPort.listCommunities.mockResolvedValue([communityDto]);

      const result = await resolver.communities();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({ id: COMMUNITY_ID, name: 'Test Community' }),
      );
    });

    it('should map cause.closed to cause.status', async () => {
      const closedCauseDto = { ...causeDto, closed: true } as CauseDto;
      mockPort.listCommunities.mockResolvedValue([
        { ...communityDto, causes: [closedCauseDto] } as CommunityOutDto,
      ]);

      const result = await resolver.communities();

      expect(result[0].causes[0].status).toBe(true);
    });

    it('should forward search and sort args to the port', async () => {
      mockPort.listCommunities.mockResolvedValue([]);

      await resolver.communities('test', 'name', 'ASC');

      expect(mockPort.listCommunities).toHaveBeenCalledWith('test', {
        field: 'name',
        order: 'ASC',
      });
    });

    it('should pass undefined sort fields when called without sort args', async () => {
      mockPort.listCommunities.mockResolvedValue([]);

      await resolver.communities('test');

      expect(mockPort.listCommunities).toHaveBeenCalledWith('test', {
        field: undefined,
        order: undefined,
      });
    });
  });

  describe('community()', () => {
    it('should return a mapped community when the port returns right', async () => {
      mockPort.getCommunity.mockResolvedValue(right(communityDto));

      const result = await resolver.community(COMMUNITY_ID);

      expect(result).toEqual(
        expect.objectContaining({ id: COMMUNITY_ID, name: 'Test Community' }),
      );
      expect(mockPort.getCommunity).toHaveBeenCalledWith(
        COMMUNITY_ID,
        undefined,
      );
    });

    it('should forward requesterId to the port', async () => {
      const requesterId = UniqueEntityID.create().toString();
      mockPort.getCommunity.mockResolvedValue(right(communityDto));

      await resolver.community(COMMUNITY_ID, requesterId);

      expect(mockPort.getCommunity).toHaveBeenCalledWith(
        COMMUNITY_ID,
        requesterId,
      );
    });

    it('should map cause fields correctly including status from closed', async () => {
      mockPort.getCommunity.mockResolvedValue(right(communityDto));

      const result = await resolver.community(COMMUNITY_ID);

      expect(result.causes[0]).toEqual({
        id: CAUSE_ID,
        title: 'Test Cause',
        description: 'A test cause',
        duration: '3 months',
        ods: 2,
        status: false,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('should throw NotFoundException when the port returns left', async () => {
      mockPort.getCommunity.mockResolvedValue(
        left({ message: 'Community not found' }),
      );

      await expect(resolver.community('unknown-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should include the port error message in the NotFoundException', async () => {
      mockPort.getCommunity.mockResolvedValue(
        left({ message: 'Community not found' }),
      );

      await expect(resolver.community('unknown-id')).rejects.toThrow(
        'Community not found',
      );
    });
  });
});
