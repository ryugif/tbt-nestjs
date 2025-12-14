import { classToPlain } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Auth } from '../auth/auth.entity';
import { BaseModel } from '../base.model';
import { Task } from '../task/task.entity';

@Entity('projects')
export class Project extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Auth, (auth) => auth.projects)
  @JoinColumn({ name: 'created_by' })
  created_by: Auth;

  @ManyToMany(() => Auth, (auth) => auth.joinedProjects)
  @JoinTable({
    name: 'project_members',
    joinColumn: { name: 'project_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  members: Auth[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  toJSON() {
    return classToPlain(this);
  }
}
