import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CauseType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  duration: string;

  @Field(() => Int)
  ods: number;

  @Field()
  status: boolean;

  @Field()
  createdAt: string;
}
