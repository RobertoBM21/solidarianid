import {
  CauseStatisticsRow,
  CommunityActivityRow,
  OdsCount,
} from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { Test, TestingModule } from '@nestjs/testing';
import { InitiativesStatisticsPort } from '../../../domain/ports/initiatives-statistics.port';
import { InitiativesEventsController } from './initiatives-events.controller';

describe('InitiativesEventsController', () => {
  let controller: InitiativesEventsController;

  const mockStatisticsPort = {
    getOdsCounts: jest.fn(),
    getActivityData: jest.fn(),
    getCauseStatistics: jest.fn(),
    getTotalCausesCount: jest.fn(),
    getTotalSupportsCount: jest.fn(),
    getMySupports: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitiativesEventsController],
      providers: [
        {
          provide: InitiativesStatisticsPort,
          useValue: mockStatisticsPort,
        },
      ],
    }).compile();

    controller = module.get<InitiativesEventsController>(
      InitiativesEventsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleGetInitiativesStatistics', () => {
    it('should aggregate data from all statistics port methods', async () => {
      const mockOdsCounts: OdsCount[] = [{ ods: 1, count: 10 }];
      const mockActivityData: CommunityActivityRow[] = [
        { month: 1, year: 2023, communityId: 'C1', newCauses: 5 },
      ];
      const mockCauseStatistics: CauseStatisticsRow[] = [
        {
          communityId: 'c1',
          activeCauses: 10,
          closedCauses: 2,
          odsCovered: 3,
          supports: 100,
        },
      ];
      const mockTotalCauses = 50;
      const mockTotalSupports = 200;

      mockStatisticsPort.getOdsCounts.mockResolvedValue(mockOdsCounts);
      mockStatisticsPort.getActivityData.mockResolvedValue(mockActivityData);
      mockStatisticsPort.getCauseStatistics.mockResolvedValue(
        mockCauseStatistics,
      );
      mockStatisticsPort.getTotalCausesCount.mockResolvedValue(mockTotalCauses);
      mockStatisticsPort.getTotalSupportsCount.mockResolvedValue(
        mockTotalSupports,
      );

      const result = await controller.handleGetInitiativesStatistics();

      expect(result).toEqual({
        odsCount: mockOdsCounts,
        activity: mockActivityData,
        causes: mockCauseStatistics,
        totalCauses: mockTotalCauses,
        totalSupports: mockTotalSupports,
      });

      expect(mockStatisticsPort.getOdsCounts).toHaveBeenCalled();
      expect(mockStatisticsPort.getActivityData).toHaveBeenCalled();
      expect(mockStatisticsPort.getCauseStatistics).toHaveBeenCalled();
      expect(mockStatisticsPort.getTotalCausesCount).toHaveBeenCalled();
      expect(mockStatisticsPort.getTotalSupportsCount).toHaveBeenCalled();
    });
  });
});
