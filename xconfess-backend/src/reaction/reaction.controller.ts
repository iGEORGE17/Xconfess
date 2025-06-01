import { Controller, Post, Body } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { Reaction } from './entities/reaction.entity';

@Controller('reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  async addReaction(@Body() dto: CreateReactionDto): Promise<Reaction> {
    return this.reactionService.createReaction(dto);
  }
}
