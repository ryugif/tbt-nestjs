/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnprocessableEntityException,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthService } from '../auth/auth.service';
import { AccessTokenGuard } from '../../guards/accessToken.guard';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';

@Controller('tasks')
@UseGuards(AccessTokenGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    const auth = await this.authService.findOneById(
      req.user.sub as unknown as number,
    );
    if (!auth) throw new UnprocessableEntityException('Invalid user');

    const task = await this.taskService.create(
      createTaskDto,
      auth.id,
      createTaskDto.project_id,
    );
    if (!task) throw new UnprocessableEntityException('Failed to create task');
    return await this.taskService.findOne(task.id);
  }

  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
    @Query('project_id') projectId: string,
  ) {
    if (!projectId)
      throw new UnprocessableEntityException('project_id is required');

    return await this.taskService.findAll(+projectId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const findTask = await this.taskService.findOne(+id);
    if (!findTask) throw new UnprocessableEntityException('Task not found');
    if (
      findTask.created_by.id !== authId &&
      (findTask.assigned_to ? findTask.assigned_to.id !== authId : true)
    )
      throw new UnauthorizedException(
        'You are not authorized to view this task',
      );

    return findTask;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateTaskDto,
    @Req() req: any,
  ) {
    const authId = req.user.sub as unknown as number;
    const findTask = await this.taskService.findOne(+id);
    if (!findTask) throw new UnprocessableEntityException('Task not found');
    if (
      findTask.created_by.id !== authId &&
      (findTask.assigned_to ? findTask.assigned_to.id !== authId : true)
    )
      throw new UnauthorizedException(
        "You don't have permission to update this task",
      );

    if (payload.assigned_to) {
      const assignedTo = await this.authService.findOneById(
        payload.assigned_to,
      );
      if (!assignedTo)
        throw new UnprocessableEntityException('Assigned user not found');
    }

    return await this.taskService.update(+id, payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const findTask = await this.taskService.findOne(+id);
    if (!findTask) throw new UnprocessableEntityException('Task not found');
    if (findTask.created_by.id !== authId)
      throw new UnauthorizedException(
        "You don't have permission to delete this task",
      );

    await this.taskService.remove(+id);
    return null;
  }
}
