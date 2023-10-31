import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {IJWTPayload} from "@nest-rmq/interfaces";


export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  async validate({ id }: IJWTPayload) {
    return id;
  }
}
