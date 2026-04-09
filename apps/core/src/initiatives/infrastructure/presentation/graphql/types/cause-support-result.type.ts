import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CauseSupportResultType {
  @Field()
  causeId: string;

  @Field()
  userId: string;

  @Field()
  registeredAt: string;
}
