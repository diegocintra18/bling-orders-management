import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoresService } from './stores.service';
import type { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Controller('stores')
@UseGuards(AuthGuard('jwt'))
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.storesService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateStoreDto, @Request() req: { user: { sub: string } }) {
    return this.storesService.create(dto, req.user.sub);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.storesService.delete(id);
  }
}
