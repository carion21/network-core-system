import { Module } from '@nestjs/common';
import { IndividualService } from './individual.service';
import { IndividualController } from './individual.controller';
import { JwtStrategy } from 'src/auth/strategy.service';

@Module({
  controllers: [IndividualController],
  providers: [IndividualService, JwtStrategy],
  exports: [IndividualService],
})
export class IndividualModule {}
