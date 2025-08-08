import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

interface JwtPayload {
  username: string;
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const cachedToken = this.cacheService.get<string>(
      `user_${payload.sub}_token`,
    );

    if (!cachedToken || cachedToken !== token) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(payload.username);
    if (!user || user.appJwtToken !== token) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, username: payload.username } as any;
  }
}
