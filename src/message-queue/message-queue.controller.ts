import { Body, Controller, Post } from '@nestjs/common';
import { MessageQueueService } from './message-queue.service';

@Controller('messages')
export class MessageQueueController {
  constructor(private _service: MessageQueueService) {}

  @Post('')
  async sendMessage(@Body() data: { customer: string; patties: string }) {
    await this._service.sendMsgTOQueue();
  }
}
