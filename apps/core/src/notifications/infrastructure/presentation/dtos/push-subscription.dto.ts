import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

@ApiSchema({
  name: 'Push subscription keys',
})
export class PushSubscriptionKeysDto {
  @ApiProperty({
    description: 'P256DH key of the browser push subscription',
  })
  @IsString()
  readonly p256dh: string;

  @ApiProperty({
    description: 'Auth key of the browser push subscription',
  })
  @IsString()
  readonly auth: string;
}

@ApiSchema({
  name: 'Push subscription data',
})
export class PushSubscriptionDto {
  @ApiProperty({
    description: 'Browser push subscription endpoint',
  })
  @IsString()
  readonly endpoint: string;

  @ApiProperty({
    description:
      'Optional expiration timestamp of the browser push subscription',
    required: false,
    nullable: true,
    example: null,
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Type(() => Number)
  @IsNumber()
  readonly expirationTime?: number | null;

  @ApiProperty({
    description: 'Cryptographic keys of the browser push subscription',
    type: PushSubscriptionKeysDto,
  })
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  readonly keys: PushSubscriptionKeysDto;
}
