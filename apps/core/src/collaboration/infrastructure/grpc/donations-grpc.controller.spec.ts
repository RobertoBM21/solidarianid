import { Test, TestingModule } from '@nestjs/testing';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import { DonationsGrpcController } from './donations-grpc.controller';

describe('DonationsGrpcEventsController', () => {
  let controller: DonationsGrpcController;

  const mockDonationRepository = {
    getTotalDonationsAmount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsGrpcController,
        {
          provide: DonationRepository,
          useValue: mockDonationRepository,
        },
      ],
    }).compile();

    controller = module.get<DonationsGrpcController>(DonationsGrpcController);
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
