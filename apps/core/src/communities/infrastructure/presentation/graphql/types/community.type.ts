import { Field, ObjectType } from '@nestjs/graphql';
import { CauseType } from './cause.type';

@ObjectType()
export class CommunityType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  createdAt: string;

  @Field(() => [CauseType])
  causes: CauseType[];
}
