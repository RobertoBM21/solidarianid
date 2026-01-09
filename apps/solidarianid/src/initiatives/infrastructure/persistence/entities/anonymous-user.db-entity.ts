import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('anonymous_users')
export class AnonymousUserDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
