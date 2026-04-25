import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;
}
