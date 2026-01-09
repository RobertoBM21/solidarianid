import { Entity, UniqueEntityID } from '@app/shared/domain';

export interface CommunityMemberProps {
  communityId: UniqueEntityID;
  userId: UniqueEntityID;
  admin: boolean;
}

export class CommunityMember extends Entity<CommunityMemberProps> {
  private constructor(props: CommunityMemberProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get communityId(): UniqueEntityID {
    return this.props.communityId;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get admin(): boolean {
    return this.props.admin;
  }

  static create(
    props: {
      communityId: UniqueEntityID;
      userId: UniqueEntityID;
      admin: boolean;
    },
    id?: UniqueEntityID,
  ): CommunityMember {
    return new CommunityMember(props, id);
  }
}
