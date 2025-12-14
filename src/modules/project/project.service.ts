import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Project } from '../../databases/project/project.entity';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private repository: Repository<Project>,
  ) {}

  async create(payload: CreateProjectDto, authId: number) {
    const project = await this.repository.save({
      ...payload,
      created_by: { id: authId },
      members: [{ id: authId }],
    });

    return project;
  }

  async findAll(authId: number, query: PaginateQuery) {
    return paginate<Project>(query, this.repository, {
      where: {
        members: { id: authId },
        deleted_at: IsNull(),
      },
      relations: ['members'],
      sortableColumns: ['id', 'name', 'created_at'],
      nullSort: 'last',
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: ['name'],
      select: ['id', 'name', 'description', 'created_at'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
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
        members: {
          id: true,
          name: true,
        },
      },
      relations: {
        created_by: true,
        members: true,
      },
    });
  }

  async update(id: number, payload: UpdateProjectDto) {
    return await this.repository.update(id, payload);
  }

  async remove(id: number) {
    return await this.repository.update(id, { deleted_at: new Date() });
  }
}
