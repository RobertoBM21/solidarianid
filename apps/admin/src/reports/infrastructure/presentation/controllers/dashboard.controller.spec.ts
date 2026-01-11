import { right } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsDto } from '../../../application/dtos/statistics.dto';
import { StatisticsPort } from '../../../application/ports/statistics.port';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockStatsPort = {
    getGlobalStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: StatisticsPort,
          useValue: mockStatsPort,
        },
      ],
    }).compile();

    controller = app.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return dashboard data', async () => {
    const mockStats = new StatisticsDto(
      { donations: 1000, supports: 200, causes: 50, communities: 10 },
      [],
      {},
    );
    mockStatsPort.getGlobalStatistics.mockResolvedValue(right(mockStats));

    const result = await controller.dashboard();

    expect(result).toEqual({
      title: 'Estadísticas',
      stats: mockStats,
      statsJson: JSON.stringify(mockStats),
      totals: {
        donations: '1000',
        supports: '200',
        causes: '50',
        communities: '10',
      },
    });
    expect(mockStatsPort.getGlobalStatistics).toHaveBeenCalled();
  });
});
