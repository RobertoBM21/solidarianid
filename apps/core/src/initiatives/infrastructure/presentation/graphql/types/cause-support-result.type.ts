import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CauseSupportResultType {
  @Field()
  userName: string;

  @Field()
  userId: string;

  @Field()
  registeredAt: string;
}
