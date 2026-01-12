export class ReportUserDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly communities: string[],
  ) {}
}

export class ReportUsersPageDto {
  constructor(
    public readonly users: ReportUserDto[],
    public readonly totalPages: number,
  ) {}
}
