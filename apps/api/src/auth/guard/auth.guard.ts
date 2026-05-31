import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      // Attempt to authenticate
      const canActivate = await super.canActivate(context);
      if (canActivate) {
        return true;
      }
    } catch (error) {
      // If it's a public route, swallow the error and allow access (as a guest)
      if (isPublic) {
        return true;
      }
      throw error;
    }

    return isPublic;
  }
}
