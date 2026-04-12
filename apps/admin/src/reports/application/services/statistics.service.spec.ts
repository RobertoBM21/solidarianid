import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsDto } from '../dtos/statistics.dto';
import {
  CoreCollaborationStatisticsData as CollaborationStatisticsData,
  CoreCommunitiesStatisticsData as CommunitiesStatisticsData,
  CoreStatisticsPort,
  CoreInitiativesStatisticsData as InitiativesStatisticsData,
} from '../ports/core-statistics.port';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  const mockCoreStatisticsGateway: jest.Mocked<CoreStatisticsPort> = {
    getCommunitiesStatistics: jest.fn(),
    getInitiativesStatistics: jest.fn(),
    getCollaborationStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: CoreStatisticsPort,
          useValue: mockCoreStatisticsGateway,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGlobalStatistics', () => {
    it('should aggregate data from all queries and return StatisticsDto', async () => {
      const communitiesData: CommunitiesStatisticsData = {
        data: [
          { id: 'c1', name: 'Community 1', users: 10, admins: 2 },
          { id: 'c2', name: 'Community 2', users: 5, admins: 1 },
        ],
      };

      const initiativesData: InitiativesStatisticsData = {
        odsCount: [{ ods: 1, count: 5 }],
        activity: [{ month: 1, year: 2023, communityId: 'c1', newCauses: 2 }],
        causes: [
          {
            communityId: 'c1',
            activeCauses: 2,
            closedCauses: 1,
            odsCovered: 1,
            supports: 20,
          },
        ],
        totalCauses: 10,
        totalSupports: 50,
      };

      const collaborationData: CollaborationStatisticsData = {
        totalDonationsMoney: 1000,
      };

      mockCoreStatisticsGateway.getCommunitiesStatistics.mockResolvedValue(
        communitiesData,
      );
      mockCoreStatisticsGateway.getInitiativesStatistics.mockResolvedValue(
        initiativesData,
      );
      mockCoreStatisticsGateway.getCollaborationStatistics.mockResolvedValue(
        collaborationData,
      );

      const result = await service.getGlobalStatistics();

      expect(result.isRight()).toBeTruthy();
      const dto = result.value as StatisticsDto;

      expect(dto.totals).toEqual({
        causes: 10,
        communities: 2,
        donations: 1000,
        supports: 50,
      });

      expect(dto.odsCount).toEqual({ 1: 5 });
      expect(dto.activity).toEqual(initiativesData.activity);

      expect(dto.communities).toHaveLength(2);
      expect(dto.communities[0]).toEqual({
        name: 'Community 1',
        users: 10,
        admins: 2,
        activeCauses: 2,
        closedCauses: 1,
        odsCovered: 1,
        supports: 20,
      });
      expect(dto.communities[1]).toEqual({
        name: 'Community 2',
        users: 5,
        admins: 1,
        activeCauses: 0,
        closedCauses: 0,
        odsCovered: 0,
        supports: 0,
      });
    });

    it('should return error if communities query fails', async () => {
      mockCoreStatisticsGateway.getCommunitiesStatistics.mockRejectedValue(
        new Error('Comm Fail'),
      );
      mockCoreStatisticsGateway.getInitiativesStatistics.mockResolvedValue({
        odsCount: [],
        activity: [],
        causes: [],
        totalCauses: 0,
        totalSupports: 0,
      });
      mockCoreStatisticsGateway.getCollaborationStatistics.mockResolvedValue({
        totalDonationsMoney: 0,
      });

      const result = await service.getGlobalStatistics();
      expect(result.isLeft()).toBeTruthy();
      if (result.isLeft()) {
        expect(result.value.message).toBe('Comm Fail');
      }
    });

    it('should return error if initiatives query fails', async () => {
      mockCoreStatisticsGateway.getCommunitiesStatistics.mockResolvedValue({
        data: [],
      });
      mockCoreStatisticsGateway.getInitiativesStatistics.mockRejectedValue(
        new Error('Init Fail'),
      );
      mockCoreStatisticsGateway.getCollaborationStatistics.mockResolvedValue({
        totalDonationsMoney: 0,
      });

      const result = await service.getGlobalStatistics();
      expect(result.isLeft()).toBeTruthy();
      if (result.isLeft()) {
        expect(result.value.message).toBe('Init Fail');
      }
    });

    it('should return error if collaboration query fails', async () => {
      mockCoreStatisticsGateway.getCommunitiesStatistics.mockResolvedValue({
        data: [],
      });
      mockCoreStatisticsGateway.getInitiativesStatistics.mockResolvedValue({
        odsCount: [],
        activity: [],
        causes: [],
        totalCauses: 0,
        totalSupports: 0,
      });
      mockCoreStatisticsGateway.getCollaborationStatistics.mockRejectedValue(
        new Error('Collab Fail'),
      );

      const result = await service.getGlobalStatistics();
      expect(result.isLeft()).toBeTruthy();
      if (result.isLeft()) {
        expect(result.value.message).toBe('Collab Fail');
      }
    });
  });
});
