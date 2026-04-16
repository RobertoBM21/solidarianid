import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ok } from 'assert';
import { type Request } from 'express';
import { AuthId } from '../../../../identity/infrastructure/decorators/auth-id.decorator';
import { AuthGuard } from '../../../../identity/infrastructure/guards/auth.guard';
import { ActionNotFoundError } from '../../../../initiatives/domain/repositories/action.repository';
import { InitiativeAlreadyClosedError } from '../../../../initiatives/domain/value-objects/initiative-status.vo';
import { CreateDonationDto } from '../../../application/dtos/create-donation.dto';
import { DonationDto } from '../../../application/dtos/donation.dto';
import { PaymentDto } from '../../../application/dtos/payment.dto';
import { DonationsPort } from '../../../application/ports/donations.port';

@Controller('donations')
@ApiTags('collaboration')
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
    @Req() request: Request,
  ): Promise<PaymentDto> {
    const host = request.get('host');
    ok(host, 'Host header is missing');
    const url = `${request.protocol}://${host}`;

    const result = await this.donationsPort.startDonation(
      createDonationDto,
      userId,
      url,
    );
    if (result.isLeft()) {
      if (result.value instanceof ActionNotFoundError) {
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
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }
}
