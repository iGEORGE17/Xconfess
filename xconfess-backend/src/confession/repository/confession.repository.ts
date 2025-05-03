import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AnonymousConfession } from '../entities/confession.entity';

@Injectable()
export class AnonymousConfessionRepository extends Repository<AnonymousConfession> {
  constructor(private dataSource: DataSource) {
    super(AnonymousConfession, dataSource.createEntityManager());
  }
}
