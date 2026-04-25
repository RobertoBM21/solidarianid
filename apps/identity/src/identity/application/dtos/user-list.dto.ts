export interface UserListRow {
  id: string;
  name: string;
  communities: string[];
}

export interface UserListDto {
  users: UserListRow[];
  totalPages: number;
}
