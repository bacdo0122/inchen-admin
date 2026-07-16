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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  // ── Public ──────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm (public, chỉ đã đăng)' })
  findPublic(@Query() query: QueryProductDto) {
    return this.products.findPublic(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết sản phẩm theo slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  // ── Admin ───────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách sản phẩm (admin, mọi trạng thái)' })
  findAllAdmin(@Query() query: QueryProductDto) {
    return this.products.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết sản phẩm theo id (admin)' })
  findOneAdmin(@Param('id') id: string) {
    return this.products.findOneAdmin(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo sản phẩm' })
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá sản phẩm' })
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
