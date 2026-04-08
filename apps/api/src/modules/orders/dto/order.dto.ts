import { IsOptional, IsString, IsBoolean, IsArray, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class OrderFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsBoolean()
  isDelayed?: boolean;

  @IsOptional()
  @IsBoolean()
  isPicked?: boolean;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;
}

export class UpdateOrderPickedDto {
  @IsBoolean()
  isPicked: boolean;
}

export class OrderStatsDto {
  total: number;
  pending: number;
  picked: number;
  delayed: number;
  dispatched: number;
}
