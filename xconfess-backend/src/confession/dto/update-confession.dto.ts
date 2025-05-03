import { PartialType } from '@nestjs/mapped-types';
import { CreateConfessionDto } from './create-confession.dto';

export class UpdateConfessionDto extends PartialType(CreateConfessionDto) {}
