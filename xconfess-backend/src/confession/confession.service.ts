import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { AnonymousConfessionRepository } from "./repository/confession.repository";
import { CreateConfessionDto } from "./dto/create-confession.dto";
import { UpdateConfessionDto } from "./dto/update-confession.dto";
import { SearchConfessionDto } from "./dto/search-confession.dto";
import { ILike } from "typeorm";

@Injectable()
export class ConfessionService {
  constructor(private confessionRepo: AnonymousConfessionRepository) {}

  private sanitizeMessage(message: string): string {
    // Remove any potential XSS or harmful content
    return message
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  async create(createConfessionDto: CreateConfessionDto) {
    try {
      const { message } = createConfessionDto;
      const sanitizedMessage = this.sanitizeMessage(message);
      
      if (!sanitizedMessage) {
        throw new BadRequestException('Invalid confession content');
      }

      const confession = this.confessionRepo.create({ message: sanitizedMessage });
      return await this.confessionRepo.save(confession);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create confession');
    }
  }

  async findAll() {
    try {
      return await this.confessionRepo.find({ 
        order: { created_at: 'DESC' },
        relations: ['reactions']
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch confessions');
    }
  }

  async update(id: number, updateConfessionDto: UpdateConfessionDto) {
    try {
      if (updateConfessionDto.message) {
        updateConfessionDto.message = this.sanitizeMessage(updateConfessionDto.message);
      }
      return await this.confessionRepo.update(id, updateConfessionDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update confession');
    }
  }
  
  async remove(id: number) {
    try {
      return await this.confessionRepo.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete confession');
    }
  }

  async search(searchDto: SearchConfessionDto) {
    try {
      const { keyword } = searchDto;
      const sanitizedKeyword = this.sanitizeMessage(keyword);
      
      return await this.confessionRepo.find({
        where: {
          message: ILike(`%${sanitizedKeyword}%`),
        },
        order: {
          created_at: 'DESC',
        },
        relations: ['reactions']
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to search confessions');
    }
  }
}
