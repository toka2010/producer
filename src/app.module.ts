import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageQueueModule } from './message-queue/message-queue.module';

@Module({
  imports: [MessageQueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
