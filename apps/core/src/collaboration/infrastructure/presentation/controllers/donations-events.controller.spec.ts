import { Test, TestingModule } from '@nestjs/testing';
import { DonationRepository } from '../../../domain/repositories/donation.repository';
import { DonationsEventsController } from './donations-events.controller';

describe('DonationsEventsController', () => {
  let controller: DonationsEventsController;

  const mockDonationRepository = {
    getTotalDonationsAmount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsEventsController,
        {
          provide: DonationRepository,
          useValue: mockDonationRepository,
        },
      ],
    }).compile();

    controller = module.get<DonationsEventsController>(
      DonationsEventsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return total donations money', async () => {
    mockDonationRepository.getTotalDonationsAmount.mockResolvedValue(5000);

    const result = await controller.getCollaborationStatistics();

    expect(result).toEqual({ totalDonationsMoney: 5000 });
    expect(mockDonationRepository.getTotalDonationsAmount).toHaveBeenCalled();
  });
});
