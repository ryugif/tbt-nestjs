/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../guards/accessToken.guard';
import { AuthService } from '../auth/auth.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';

@Controller('projects')
@UseGuards(AccessTokenGuard)
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const auth = await this.authService.findOneById(authId);
    if (!auth) throw new UnprocessableEntityException('Invalid user');

    const project = await this.projectService.create(createProjectDto, auth.id);
    if (!project)
      throw new UnprocessableEntityException('Failed to create project');

    const createdProject = await this.projectService.findOne(project.id);
    return createdProject;
  }

  @Get()
  async findAll(@Paginate() query: PaginateQuery, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    return await this.projectService.findAll(authId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const authId = req.user.sub as unknown as number;

    const project = await this.projectService.findOne(+id);
    if (!project) throw new NotFoundException('Project not found');

    if (project.members.findIndex((member) => member.id === authId) === -1)
      throw new UnauthorizedException('You are not a member of this project');

    return project;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const authId = req.user.sub as unknown as number;
    const findProject = await this.projectService.findOne(+id);
    if (!findProject) throw new NotFoundException('Project not found');

    if (findProject.created_by.id !== authId)
      throw new UnauthorizedException(
        "You don't have permission to update this project",
      );

    const project = await this.projectService.update(+id, updateProjectDto);
    if (!project) throw new NotFoundException('Project not found');

    return await this.projectService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const findProject = await this.projectService.findOne(+id);
    if (!findProject) throw new NotFoundException('Project not found');
    if (findProject.created_by.id !== authId)
      throw new UnauthorizedException(
        "You don't have permission to delete this project",
      );

    await this.projectService.remove(+id);
    return null;
  }
}
