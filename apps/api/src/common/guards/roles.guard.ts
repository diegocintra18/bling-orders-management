import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload, UserRole } from '@bling-orders/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly roles: UserRole[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    return this.roles.includes(user?.role);
  }
}
