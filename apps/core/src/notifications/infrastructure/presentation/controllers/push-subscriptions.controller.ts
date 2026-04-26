import { AuthGuard, AuthId } from '@app/shared/infrastructure/auth';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PushSubscriptionsPort } from '../../../application/ports/push-subscriptions.port';
import { PushSubscriptionDto } from '../dtos/push-subscription.dto';

@Controller()
@ApiTags('push-subscriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PushSubscriptionsController {
  constructor(private readonly pushSubscriptionsPort: PushSubscriptionsPort) {}

  @Post('push-subscriptions')
  @ApiBody({
    type: PushSubscriptionDto,
    description: 'Push subscription payload',
  })
  @ApiCreatedResponse({
    description: 'Push subscription registered successfully',
  })
  async registerPushSubscription(
    @AuthId() userId: string,
    @Body() dto: PushSubscriptionDto,
  ): Promise<void> {
    await this.pushSubscriptionsPort.registerSubscription(userId, {
      endpoint: dto.endpoint,
      expirationTime: dto.expirationTime,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
    });
  }

  @Delete('push-subscriptions/:endpoint')
  @ApiParam({
    name: 'endpoint',
    description: 'Encoded push subscription endpoint to remove',
  })
  @ApiOkResponse({
    description: 'Push subscription removed successfully',
  })
  async removePushSubscription(
    @AuthId() userId: string,
    @Param('endpoint') endpoint: string,
  ): Promise<void> {
    await this.pushSubscriptionsPort.removeSubscription(userId, endpoint);
  }
}
