import { DomainEvent } from '../event';

export interface UserListRow {
  id: string;
  name: string;
  communities: string[];
}

export interface GetUsersQueryResult {
  users: UserListRow[];
  totalPages: number;
}

export class GetUsersQuery extends DomainEvent {
  constructor(
    public readonly page?: number,
    public readonly search?: string,
  ) {
    super();
  }
}
