import { v4 as uuidv4, validate } from 'uuid';

export class UniqueEntityID {
  readonly value: string;

  private constructor(plainId?: string) {
    if (plainId) {
      this.value = plainId;
    } else {
      this.value = uuidv4();
    }
  }

  equals(other: UniqueEntityID) {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(plainId?: string): UniqueEntityID {
    if (plainId && !validate(plainId)) {
      // We don't use either here as all IDs come from inside the trust boundary
      throw Error('Invalid UUID v4: ' + plainId);
    }
    return new UniqueEntityID(plainId);
  }
}

export abstract class Entity<T> {
  readonly id: UniqueEntityID;
  protected readonly props: T;

  protected constructor(props: T, id?: UniqueEntityID) {
    this.id = id ?? UniqueEntityID.create();
    this.props = props;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null) {
      return false;
    }
    if (this === object) {
      return true;
    }

    return this.id.equals(object.id);
  }
}
