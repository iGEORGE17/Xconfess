import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionController } from './confession.controller';
import { ConfessionService } from './confession.service';

describe('ConfessionController', () => {
  let controller: ConfessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfessionController],
      providers: [ConfessionService],
    }).compile();

    controller = module.get<ConfessionController>(ConfessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
