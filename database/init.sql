create table communities (
  id serial primary key,
  name varchar(255) not null,
  description text,
  created_at timestamp default current_timestamp
);

insert into communities (name, description) values
  ('Community A', 'Description for Community A'),
  ('Community B', 'Description for Community B');
