import { ValueObject } from '@app/shared/domain';

export enum MemberRoles {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class MemberRole extends ValueObject<boolean> {
  private constructor(props: boolean) {
    super(props);
  }

  isAdmin(): boolean {
    return this.props;
  }

  isMember(): boolean {
    return !this.props;
  }

  asBoolean(): boolean {
    return this.props;
  }

  asEnum(): MemberRoles {
    return this.props ? MemberRoles.ADMIN : MemberRoles.MEMBER;
  }

  static create(value: boolean): MemberRole {
    return new MemberRole(value);
  }

  static admin(): MemberRole {
    return new MemberRole(true);
  }

  static member(): MemberRole {
    return new MemberRole(false);
  }
}
