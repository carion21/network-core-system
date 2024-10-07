import { PartialType } from '@nestjs/swagger';
import { CreateDistributionChannelDto } from './create-distribution-channel.dto';

export class UpdateDistributionChannelDto extends PartialType(CreateDistributionChannelDto) {}
