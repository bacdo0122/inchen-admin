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
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { QueryColorDto } from './dto/query-color.dto';

@ApiTags('colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colors: ColorsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách màu (public), lọc theo tông' })
  findAll(@Query() query: QueryColorDto) {
    return this.colors.findAll(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết màu theo id (admin)' })
  findOne(@Param('id') id: string) {
    return this.colors.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm màu' })
  create(@Body() dto: CreateColorDto) {
    return this.colors.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật màu' })
  update(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    return this.colors.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá màu' })
  remove(@Param('id') id: string) {
    return this.colors.remove(id);
  }
}
