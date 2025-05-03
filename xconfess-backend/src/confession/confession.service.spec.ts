import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionService } from './confession.service';

describe('ConfessionService', () => {
  let service: ConfessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfessionService],
    }).compile();

    service = module.get<ConfessionService>(ConfessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
