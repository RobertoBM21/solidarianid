import { GetUsersQuery } from './get-users.query';

describe('GetUsersQuery', () => {
  it('should create an instance of GetUsersQuery with the given parameters', () => {
    const page = 2;
    const search = 'John';
    const query = new GetUsersQuery(page, search);
    expect(query).toBeInstanceOf(GetUsersQuery);
    expect(query.page).toBe(page);
    expect(query.search).toBe(search);
  });

  it('should create an instance of GetUsersQuery without parameters', () => {
    const query = new GetUsersQuery();
    expect(query).toBeInstanceOf(GetUsersQuery);
    expect(query.page).toBeUndefined();
    expect(query.search).toBeUndefined();
  });
});
