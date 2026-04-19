import {
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
  ValueObject,
} from '@app/shared/domain';
import { ActionDefEntity } from '../entities/action.entity';

export class InvalidActionsListError implements DomainError {
  constructor(public readonly message: string) {}
}

export class ActionsList extends ValueObject<ActionDefEntity[]> {
  private map: Map<string, ActionDefEntity>;

  private constructor(actions: ActionDefEntity[]) {
    super(actions);
    this.map = new Map(actions.map((action) => [action.id.toString(), action]));
  }

  get value(): ActionDefEntity[] {
    return this.props;
  }

  getAction(actionId: UniqueEntityID): ActionDefEntity | undefined {
    return this.map.get(actionId.toString());
  }

  withAdded(
    action: ActionDefEntity,
  ): Either<InvalidActionsListError, ActionsList> {
    if (this.props.some((a) => a.id.equals(action.id))) {
      return left(
        new InvalidActionsListError(
          `Action with id ${action.id.toString()} already exists in the list.`,
        ),
      );
    }
    return right(new ActionsList([...this.props, action]));
  }

  static create(
    actions: ActionDefEntity[],
  ): Either<InvalidActionsListError, ActionsList> {
    const seen = new Set<string>();

    for (const { id } of actions) {
      if (seen.has(id.value)) {
        return left(
          new InvalidActionsListError(`Duplicate action id: ${id.value}`),
        );
      }
      seen.add(id.value);
    }

    return right(new ActionsList(actions));
  }
}
