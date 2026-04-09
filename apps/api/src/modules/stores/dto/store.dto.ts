import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.Name || value?.name || value)
  name: string;
}

export class UpdateStoreDto {
  @IsString()
  @Transform(({ value }) => value?.Name || value?.name || value)
  name?: string;
}
