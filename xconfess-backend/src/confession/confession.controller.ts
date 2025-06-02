import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ConfessionService } from './confession.service';
import { CreateConfessionDto } from './dto/create-confession.dto';
import { UpdateConfessionDto } from './dto/update-confession.dto';
import { SearchConfessionDto } from './dto/search-confession.dto';

@Controller('confessions')
export class ConfessionController {
  constructor(private readonly confessionService: ConfessionService) {}

  @Post()
  create(@Body() createConfessionDto: CreateConfessionDto) {
    return this.confessionService.create(createConfessionDto);
  }

  @Get()
  findAll() {
    return this.confessionService.findAll();
  }

  @Get('search')
  search(@Query() searchDto: SearchConfessionDto) {
    return this.confessionService.search(searchDto);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfessionDto: UpdateConfessionDto) {
    return this.confessionService.update(id, updateConfessionDto);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.confessionService.remove(id);
  }
}
