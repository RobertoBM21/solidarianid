import { left, right } from '@app/shared/domain';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { type Request } from 'express';
import { v4 } from 'uuid';
import { ActionNotFoundError } from '../../../../initiatives/domain/repositories/action.repository';
import { InitiativeAlreadyClosedError } from '../../../../initiatives/domain/value-objects/initiative-status.vo';
import { DonationsPort } from '../../../application/ports/donations.port';
import { PaymentsGatewaryError } from '../../../application/ports/payments-gateway.port';
import { DonationsController } from './donations.controller';

describe('DonationsController', () => {
  let controller: DonationsController;

  const mockDonationsPort = {
    startDonation: jest.fn(),
    completeDonation: jest.fn(),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [DonationsController],
      providers: [
        {
          provide: DonationsPort,
          useValue: mockDonationsPort,
        },
      ],
    }).compile();

    controller = app.get(DonationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDonation', () => {
    it('should start a donation process', async () => {
      const mockPaymentDto = {
        url: 'https://payment-gateway.test/pay/12345',
      };

      mockDonationsPort.startDonation.mockResolvedValue(right(mockPaymentDto));

      const createDonationDto = {
        fundingActionId: v4(),
        amount: 100.0,
      };
      const userId = v4();
      const request: any = {
        protocol: 'https',
        get: () => 'example.com',
      };

      const result = await controller.createDonation(
        createDonationDto,
        userId,
        request as Request,
      );

      expect(result).toEqual(mockPaymentDto);
      expect(mockDonationsPort.startDonation).toHaveBeenCalledWith(
        createDonationDto,
        userId,
        'https://example.com',
      );
    });

    it('should fail on action not found error', async () => {
      mockDonationsPort.startDonation.mockResolvedValue(
        left(new ActionNotFoundError('Funding action not found')),
      );

      const createDonationDto = {
        fundingActionId: v4(),
        amount: 100.0,
      };
      const userId = v4();
      const request: any = {
        protocol: 'https',
        get: () => 'example.com',
      };

      await expect(
        controller.createDonation(
          createDonationDto,
          userId,
          request as Request,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(mockDonationsPort.startDonation).toHaveBeenCalledWith(
        createDonationDto,
        userId,
        'https://example.com',
      );
    });

    it('should fail on initiative already closed error', async () => {
      mockDonationsPort.startDonation.mockResolvedValue(
        left(new InitiativeAlreadyClosedError()),
      );

      const createDonationDto = {
        fundingActionId: v4(),
        amount: 100.0,
      };
      const userId = v4();
      const request: any = {
        protocol: 'https',
        get: () => 'example.com',
      };

      await expect(
        controller.createDonation(
          createDonationDto,
          userId,
          request as Request,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockDonationsPort.startDonation).toHaveBeenCalledWith(
        createDonationDto,
        userId,
        'https://example.com',
      );
    });

    it('should fail on payments gateway error', async () => {
      mockDonationsPort.startDonation.mockResolvedValue(
        left(new PaymentsGatewaryError('Payment gateway error')),
      );

      const createDonationDto = {
        fundingActionId: v4(),
        amount: 100.0,
      };
      const userId = v4();
      const request: any = {
        protocol: 'https',
        get: () => 'example.com',
      };

      await expect(
        controller.createDonation(
          createDonationDto,
          userId,
          request as Request,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockDonationsPort.startDonation).toHaveBeenCalledWith(
        createDonationDto,
        userId,
        'https://example.com',
      );
    });
  });

  describe('completeDonation', () => {
    it('should complete a donation process', async () => {
      const mockDonationDto = {
        id: v4(),
        fundingActionId: v4(),
        amount: 100.0,
        donorId: v4(),
        createdAt: new Date().toISOString(),
      };

      mockDonationsPort.completeDonation.mockResolvedValue(
        right(mockDonationDto),
      );

      const externalPaymentId = 'payment-12345';

      const result = await controller.completeDonation(externalPaymentId);

      expect(result).toEqual(mockDonationDto);
      expect(mockDonationsPort.completeDonation).toHaveBeenCalledWith(
        externalPaymentId,
      );
    });

    it('should fail on payments gateway error', async () => {
      mockDonationsPort.completeDonation.mockResolvedValue(
        left(new PaymentsGatewaryError('Payment verification failed')),
      );

      const externalPaymentId = 'payment-12345';

      await expect(
        controller.completeDonation(externalPaymentId),
      ).rejects.toThrow(BadRequestException);
      expect(mockDonationsPort.completeDonation).toHaveBeenCalledWith(
        externalPaymentId,
      );
    });
  });
});
