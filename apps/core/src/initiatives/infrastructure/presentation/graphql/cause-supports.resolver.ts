import {
  BadRequestException,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { GqlAuthId } from '../../../../identity/infrastructure/decorators/gql-auth-id.decorator';
import { GqlAuthGuard } from '../../../../identity/infrastructure/guards/gql-auth.guard';
import {
  AlreadySupportingError,
  CauseSupportsPort,
} from '../../../application/ports/cause-supports.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';
import { CAUSE_SUPPORT_PUBSUB } from '../../graphql/pubsub.provider';
import { CauseSupportResultType } from './types/cause-support-result.type';

const CAUSE_SUPPORT_REGISTERED = 'causeSupportRegistered';

@Resolver()
export class CauseSupportsResolver {
  constructor(
    private readonly causeSupportsPort: CauseSupportsPort,
    @Inject(CAUSE_SUPPORT_PUBSUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => Boolean, {
    description: 'Register support for a cause (authenticated users only)',
  })
  @UseGuards(GqlAuthGuard)
  async registerCauseSupport(
    @Args('causeId') causeId: string,
    @GqlAuthId() userId: string,
  ): Promise<boolean> {
    const result = await this.causeSupportsPort.registerSupportForUser({
      causeId,
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof CauseNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AlreadySupportingError) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    const payload: CauseSupportResultType = {
      userName: result.value.supporterName,
      userId: result.value.supporterId,
      registeredAt: result.value.createdAt.toISOString(),
    };

    await this.pubSub.publish(CAUSE_SUPPORT_REGISTERED, {
      [CAUSE_SUPPORT_REGISTERED]: payload,
    });
    await this.pubSub.publish(`${CAUSE_SUPPORT_REGISTERED}.${causeId}`, {
      [CAUSE_SUPPORT_REGISTERED]: payload,
    });

    return true;
  }

  @Subscription(() => CauseSupportResultType, {
    description: 'Subscribe to cause support events',
    resolve: (payload: { causeSupportRegistered: CauseSupportResultType }) =>
      payload.causeSupportRegistered,
  })
  causeSupportRegistered(
    @Args('causeId', { nullable: true }) causeId?: string,
  ) {
    const topic = causeId
      ? `${CAUSE_SUPPORT_REGISTERED}.${causeId}`
      : CAUSE_SUPPORT_REGISTERED;
    return this.pubSub.asyncIterableIterator(topic);
  }
}
