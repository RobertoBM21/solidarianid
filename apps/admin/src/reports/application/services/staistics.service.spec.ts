import { DomainEventsPort, left, right } from '@app/shared/domain';
import {
  CollaborationStatisticsData,
  GetCollaborationStatisticsQuery,
} from '@app/shared/domain/queries/get-collaboration-statistics.query';
import {
  CommunitiesStatisticsData,
  GetCommunitiesStatisticsQuery,
} from '@app/shared/domain/queries/get-communities-statistics.query';
import {
  GetInitiativesStatisticsQuery,
  InitiativesStatisticsData,
} from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsDto } from '../dtos/statistics.dto';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const mockDomainEventsPort = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: DomainEventsPort,
          useValue: mockDomainEventsPort,
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

      mockDomainEventsPort.query.mockImplementation((query) => {
        if (query instanceof GetCommunitiesStatisticsQuery) {
          return Promise.resolve(right(communitiesData));
        }
        if (query instanceof GetInitiativesStatisticsQuery) {
          return Promise.resolve(right(initiativesData));
        }
        if (query instanceof GetCollaborationStatisticsQuery) {
          return Promise.resolve(right(collaborationData));
        }
        return Promise.reject(new Error('Unknown query'));
      });

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
      mockDomainEventsPort.query.mockImplementation((query) => {
        if (query instanceof GetCommunitiesStatisticsQuery) {
          return Promise.resolve(left(new Error('Comm Fail')));
        }
        return Promise.resolve(right({}));
      });

      const result = await service.getGlobalStatistics();
      expect(result.isLeft()).toBeTruthy();
      expect((result.value as Error).message).toBe('Comm Fail');
    });

    it('should return error if initiatives query fails', async () => {
      mockDomainEventsPort.query.mockImplementation((query) => {
        if (query instanceof GetCommunitiesStatisticsQuery) {
          return Promise.resolve(right({ data: [] }));
        }
        if (query instanceof GetInitiativesStatisticsQuery) {
          return Promise.resolve(left(new Error('Init Fail')));
        }
        if (query instanceof GetCollaborationStatisticsQuery) {
          return Promise.resolve(right({ totalDonationsMoney: 0 }));
        }
        return Promise.resolve(right({}));
      });

      const result = await service.getGlobalStatistics();
      expect(result.isLeft()).toBeTruthy();
      expect((result.value as Error).message).toBe('Init Fail');
    });

    it('should return error if collaboration query fails', async () => {
      mockDomainEventsPort.query.mockImplementation((query) => {
        if (query instanceof GetCommunitiesStatisticsQuery) {
          return Promise.resolve(right({ data: [] }));
        }
        if (query instanceof GetInitiativesStatisticsQuery) {
          return Promise.resolve(
            right({
              odsCount: [],
              activity: [],
              causes: [],
              totalCauses: 0,
              totalSupports: 0,
            }),
          );
        }
        if (query instanceof GetCollaborationStatisticsQuery) {
          return Promise.resolve(left(new Error('Collab Fail')));
        }
        return Promise.resolve(right({}));
      });

      const result = await service.getGlobalStatistics();
      expect(result.isLeft()).toBeTruthy();
      expect((result.value as Error).message).toBe('Collab Fail');
    });
  });
});
