import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  // ── Public ──────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết (public, chỉ đã đăng)' })
  findPublic(@Query() query: QueryPostDto) {
    return this.posts.findPublic(query);
  }

  // ── Admin ───────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách bài viết (admin, mọi trạng thái)' })
  findAllAdmin(@Query() query: QueryPostDto) {
    return this.posts.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết bài viết theo id (admin)' })
  findOneAdmin(@Param('id') id: string) {
    return this.posts.findOneAdmin(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết bài viết theo slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.posts.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài viết' })
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá bài viết' })
  remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }
}
