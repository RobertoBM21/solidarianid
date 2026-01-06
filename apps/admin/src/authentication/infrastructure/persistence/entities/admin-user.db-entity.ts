import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUserDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;
}
