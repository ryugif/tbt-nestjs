import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../../databases/task/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {}

  async create(payload: CreateTaskDto, authId: number, projectId: number) {
    return await this.repository.save({
      ...payload,
      status: 'pending',
      created_by: { id: authId },
      project: { id: projectId },
      assigned_to: payload.assigned_to ? { id: payload.assigned_to } : null,
    });
  }

  async findAll(projectId: number, query: PaginateQuery) {
    return paginate<Task>(query, this.repository, {
      where: {
        project: { id: +projectId },
        deleted_at: IsNull(),
      },
      relations: ['assigned_to'],
      sortableColumns: ['id', 'title', 'status', 'created_at'],
      nullSort: 'last',
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: ['title', 'status'],
      select: [
        'id',
        'title',
        'status',
        'created_at',
        'assigned_to.id',
        'assigned_to.name',
      ],
      filterableColumns: {
        title: [FilterOperator.ILIKE],
        status: [FilterOperator.EQ],
      },
    });
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: { id, deleted_at: IsNull() },
      select: {
        created_by: {
          id: true,
          name: true,
        },
        assigned_to: {
          id: true,
          name: true,
        },
        project: {
          id: true,
          name: true,
          description: true,
        },
      },
      relations: ['created_by', 'assigned_to', 'project'],
    });
  }

  async update(id: number, payload: UpdateTaskDto) {
    return await this.repository.update(id, {
      ...payload,
      assigned_to: payload.assigned_to ? { id: payload.assigned_to } : null,
    });
  }

  async remove(id: number) {
    return await this.repository.update(id, { deleted_at: new Date() });
  }
}
