import { Module } from '@nestjs/common';
import { MessageQueueService } from './message-queue.service';
import { MessageQueueController } from './message-queue.controller';

@Module({
  providers: [MessageQueueService],
  controllers: [MessageQueueController]
})
export class MessageQueueModule {}
