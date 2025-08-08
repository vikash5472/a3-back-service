import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { SmsService } from './sms.service';
import { CacheService } from './cache.service';
import { QueueService } from './queue.service';

@Module({
  providers: [SendgridService, SmsService, CacheService, QueueService],
  exports: [SendgridService, SmsService, CacheService, QueueService],
})
export class CommonModule {}
