import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class MessageQueueService {
  private _connection: amqp.AmqpConnectionManager;
  private _operationsChannelWrapper: amqp.ChannelWrapper;
  private channel: Channel;

  async onModuleInit(): Promise<void> {
    await new Promise<void>(async (resolve, reject) => {
      this._connection = amqp.connect('amqp://localhost:5672');
      this._operationsChannelWrapper = await this._connection.createChannel({
        setup: function (channel: Channel) {
          return Promise.all(
            []
              .concat(
                channel.assertExchange('A_COMMENT_CREATED', 'fanout', {
                  durable: true,
                }),
                channel.assertExchange('A_COMMENT_DELETED', 'fanout', {
                  durable: true,
                }),
                channel.assertExchange('A_COMMENT_UPDATED', 'fanout', {
                  durable: true,
                }),
              )
              .concat(
                channel.assertExchange('TTL-COMMENTS', 'direct', {
                  durable: true,
                }),
              )
              .concat(
                channel.assertExchange('DLX-COMMENTS', 'fanout', {
                  durable: true,
                }),
              )
              .concat(channel.assertQueue('commentss', { durable: true }))
              .concat([
                channel.assertQueue('comments-retry-1-30s', {
                  durable: true,
                  deadLetterExchange: 'DLX-COMMENTS',
                  messageTtl: 30000,
                }),
                channel.assertQueue('comments-retry-2-10m', {
                  durable: true,
                  deadLetterExchange: 'DLX-COMMENTS',
                  messageTtl: 60000,
                }),
                channel.assertQueue('comments-retry-3-48h', {
                  durable: true,
                  deadLetterExchange: 'DLX-COMMENTS',
                  messageTtl:120000,
                }),
              ])
              .concat(
                channel.bindQueue('commentss', 'A_COMMENT_CREATED'),
                channel.bindQueue('commentss', 'A_COMMENT_DELETED'),
                channel.bindQueue('commentss', 'A_COMMENT_UPDATED'),
              )
              .concat(channel.bindQueue('commentss', 'DLX-COMMENTS'))
              .concat(
                channel.bindQueue(
                  'comments-retry-1-30s',
                  'TTL-COMMENTS',
                  'retry-1',
                ),
                channel.bindQueue(
                  'comments-retry-2-10m',
                  'TTL-COMMENTS',
                  'retry-2',
                ),
                channel.bindQueue(
                  'comments-retry-3-48h',
                  'TTL-COMMENTS',
                  'retry-3',
                ),
              ),
          );
        },
      });

      this._connection.on('connect', function () {
        console.log('[!] AMQP Connected: ');
        resolve();
      });

      this._connection.on('disconnect', function (params) {
        console.log('[!] AMQP Disconnected: ', params.err.stack);
      });
    });
  }


  async sendMsgTOQueue() {

    const receiverMessage = {
      data: { customer: 'john', patties: '2' },
      pattern: 'A_COMMENT_CREATED',
    };
    const context = await this._operationsChannelWrapper.sendToQueue(
      'commentss',

      Buffer.from(JSON.stringify(receiverMessage)),
    );

    console.log(
      '🚀 ~ file: message-queue.service.ts:110 ~ MessageQueueService ~ sendMsgTOQueue ~ context',
      context,
    );
   
  }
}
