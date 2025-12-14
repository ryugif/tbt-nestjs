import { classToPlain } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Auth } from '../auth/auth.entity';
import { BaseModel } from '../base.model';
import { Project } from '../project/project.entity';

@Entity()
export class Task extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'done'],
    default: 'pending',
  })
  status: 'pending' | 'in_progress' | 'done';

  @Column({ type: 'date', nullable: true })
  due_date?: string | null;

  @ManyToOne(() => Auth, (auth) => auth.tasks, { nullable: true })
  assigned_to?: Auth | null;

  @ManyToOne(() => Auth, (auth) => auth.id)
  created_by: Auth;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @Column({ nullable: true })
  debug_column?: string;

  toJSON() {
    return classToPlain(this);
  }
}
