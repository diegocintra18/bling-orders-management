import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateStoreDto {
  @IsString()
  name?: string;
}
