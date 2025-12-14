import { Exclude, classToPlain } from 'class-transformer';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseModel } from '../base.model';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';

@Entity('users')
export class Auth extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 300 })
  password: string;

  @ManyToMany(() => Project, (project) => project.members)
  joinedProjects: Project[];

  @OneToMany(() => Project, (project) => project.created_by)
  projects: Project[];

  @OneToMany(() => Task, (task) => task.assigned_to)
  tasks: Task[];

  toJSON() {
    return classToPlain(this);
  }
}
