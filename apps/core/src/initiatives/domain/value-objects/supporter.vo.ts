import { DomainError, UniqueEntityID, ValueObject } from '@app/shared/domain';

export class InvalidSupporterError implements DomainError {
  readonly message: string;
  constructor(msg: string) {
    this.message = msg;
  }
}

export abstract class Supporter extends ValueObject<UniqueEntityID> {
  protected constructor(id: UniqueEntityID) {
    super(id);
  }

  get id(): UniqueEntityID {
    return this.props;
  }

  abstract isUser(): this is UserSupporter;
  abstract isAnonymous(): this is AnonymousSupporter;
}

export class UserSupporter extends Supporter {
  isUser(): this is UserSupporter {
    return true;
  }

  isAnonymous(): this is AnonymousSupporter {
    return false;
  }

  static create(id: UniqueEntityID): UserSupporter {
    return new UserSupporter(id);
  }
}

export class AnonymousSupporter extends Supporter {
  isUser(): this is UserSupporter {
    return false;
  }

  isAnonymous(): this is AnonymousSupporter {
    return true;
  }

  static create(id: UniqueEntityID): AnonymousSupporter {
    return new AnonymousSupporter(id);
  }
}
