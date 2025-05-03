import { Injectable } from "@nestjs/common";
import { AnonymousConfessionRepository } from "./repository/confession.repository";
import { CreateConfessionDto } from "./dto/create-confession.dto";
import { UpdateConfessionDto } from "./dto/update-confession.dto";

@Injectable()
export class ConfessionService {
  constructor(private confessionRepo: AnonymousConfessionRepository) {}

  create(createConfessionDto: CreateConfessionDto) {
    const { message } = createConfessionDto;
    const confession = this.confessionRepo.create({ message });
    return this.confessionRepo.save(confession);
  }

  findAll() {
    return this.confessionRepo.find({ order: { created_at: 'DESC' } });
  }

  findOne(id: number) {
    return this.confessionRepo.findOneBy({ id });
  }
  
  update(id: number, updateConfessionDto: UpdateConfessionDto) {
    return this.confessionRepo.update(id, updateConfessionDto);
  }
  
  remove(id: number) {
    return this.confessionRepo.delete(id);
  }
}
