import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('comments')
export class CommentController {
  constructor(private readonly service: CommentService) {}

  @UseGuards(AuthGuard)
  @Post(':confessionId')
  create(
    @Param('confessionId') confessionId: string,
    @Body('content') content: string,
    @Req() req: Request,
    @Body('anonymousContextId') anonymousContextId: string,
  ) {
    const user = req.user as any; 
    return this.service.create(content, user, confessionId, anonymousContextId);
  }

  @Get('by-confession/:confessionId')
  findByConfession(@Param('confessionId') confessionId: string) {
    return this.service.findByConfessionId(confessionId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.service.delete(+id, user);
  }
}
