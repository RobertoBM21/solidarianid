import {
  CauseStatisticsRow,
  CommunityActivityRow,
  OdsCount,
} from '@app/shared/application/dtos/initiatives-statistics.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { InitiativesStatisticsPort } from '../../domain/ports/initiatives-statistics.port';
import { InitiativesGrpcController } from './initiatives-grpc.controller';

describe('InitiativesGrpcEventsController', () => {
  let controller: InitiativesGrpcController;

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
      controllers: [InitiativesGrpcController],
      providers: [
        {
          provide: InitiativesStatisticsPort,
          useValue: mockStatisticsPort,
        },
      ],
    }).compile();

    controller = module.get<InitiativesGrpcController>(
      InitiativesGrpcController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInitiativesStatistics', () => {
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

      const result = await controller.getInitiativesStatistics();

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
