/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator';
import { isPublicRoute } from '.';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    if (isPublicRoute(this.reflector, context)) return true;
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];

    if (!requiredRoles.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    return requiredRoles.includes(user.role);
  }
}

// canActivate(context: ExecutionContext): boolean {
//   if (isPublicRoute(this.reflector, context)) return true;

//   const requiredRoles =
//     this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]) ?? [];

//   if (!requiredRoles.length) return true;

//   const request = context.switchToHttp().getRequest();
//   const user = request.user;

//   if (!user) return false;

//   return requiredRoles.includes(user.role);
// }
