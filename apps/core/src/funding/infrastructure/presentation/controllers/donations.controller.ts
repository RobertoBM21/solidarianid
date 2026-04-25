import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { AuthGuard, AuthId } from '@app/shared/infrastructure/auth';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateDonationDto } from '../../../application/dtos/create-donation.dto';
import { DonationDto } from '../../../application/dtos/donation.dto';
import { PaymentDto } from '../../../application/dtos/payment.dto';
import { DonationsPort } from '../../../application/ports/donations.port';
import { FundingActionNotFoundError } from '../../../domain/repositories/funding-action.repository';

@Controller('donations')
@ApiTags('funding')
export class DonationsController {
  constructor(private readonly donationsPort: DonationsPort) {}

  /**
   * Starts a donation process.
   *
   * @throws {400} Invalid donation request.
   * @throws {403} Initiative is closed and not accepting donations.
   * @throws {404} Founding action not found.
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateDonationDto })
  @ApiCreatedResponse({
    description: 'Donation created successfully',
    type: PaymentDto,
  })
  @ApiBearerAuth()
  async createDonation(
    @Body() createDonationDto: CreateDonationDto,
    @AuthId() userId: string,
  ): Promise<PaymentDto> {
    const result = await this.donationsPort.startDonation(
      createDonationDto,
      userId,
    );
    if (result.isLeft()) {
      if (result.value instanceof FundingActionNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      if (result.value instanceof InitiativeAlreadyClosedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  /**
   * Completes a donation process.
   *
   * @throws {400} Invalid payment or donation could not be completed.
   * @throws {404} Founding action not found.
   */
  @Get('complete/:externalPaymentId')
  @ApiOkResponse({
    description: 'Donation completed successfully',
    type: DonationDto,
  })
  async completeDonation(
    @Param('externalPaymentId') externalPaymentId: string,
  ): Promise<DonationDto> {
    const result = await this.donationsPort.completeDonation(externalPaymentId);
    if (result.isLeft()) {
      if (result.value instanceof FundingActionNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }
}
