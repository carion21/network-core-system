import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { NodeModule } from 'src/node/node.module';
import { IndividualModule } from 'src/individual/individual.module';

@Module({
  controllers: [JobController],
  providers: [JobService],
  imports: [NodeModule, IndividualModule],
})
export class JobModule {}
