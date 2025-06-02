import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AnonymousConfessionRepository } from "./repository/confession.repository";
import { CreateConfessionDto } from "./dto/create-confession.dto";
import { UpdateConfessionDto } from "./dto/update-confession.dto";
import { SearchConfessionDto } from "./dto/search-confession.dto";
import { ILike } from "typeorm";
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class ConfessionService {
  constructor(private confessionRepo: AnonymousConfessionRepository) {}

  private sanitizeMessage(message: string): string {
    return sanitizeHtml(message, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
      disallowedTagsMode: 'recursiveEscape'
    }).trim();
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

  async update(id: string, updateConfessionDto: UpdateConfessionDto) {
    try {
      // First check if the confession exists
      const confession = await this.confessionRepo.findOne({ where: { id } });
      if (!confession) {
        throw new NotFoundException(`Confession with ID ${id} not found`);
      }

      if (updateConfessionDto.message) {
        updateConfessionDto.message = this.sanitizeMessage(updateConfessionDto.message);
        if (!updateConfessionDto.message) {
          throw new BadRequestException('Invalid confession content');
        }
      }

      await this.confessionRepo.update(id, updateConfessionDto);
      return await this.confessionRepo.findOne({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update confession');
    }
  }
  
  async remove(id: string) {
    try {
      // First check if the confession exists
      const confession = await this.confessionRepo.findOne({ where: { id } });
      if (!confession) {
        throw new NotFoundException(`Confession with ID ${id} not found`);
      }

      await this.confessionRepo.delete(id);
      return { message: 'Confession successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete confession');
    }
  }

  async search(searchDto: SearchConfessionDto) {
    try {
      const { keyword } = searchDto;
      // Remove sanitization to allow special characters in search
      return await this.confessionRepo.find({
        where: {
          message: ILike(`%${keyword}%`),
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
