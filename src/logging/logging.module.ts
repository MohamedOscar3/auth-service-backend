import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss',
                  },
                },
            level: isProduction ? 'info' : 'debug',
            // Remove sensitive data from logs
            redact: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
            ],
            // Add request context
            customProps: (req: IncomingMessage) => {
              // Access the request ID and user from req if available
              // Using type assertion since NestJS adds these properties
              const reqWithId = req as unknown as { id?: string };
              const reqWithUser = req as unknown as {
                user?: { userId: string };
              };

              return {
                correlationId: reqWithId.id || 'unknown',
                userId: reqWithUser.user?.userId || 'anonymous',
              };
            },
            // Custom serializers
            serializers: {
              req: (req: {
                id: string;
                method: string;
                url: string;
                query: Record<string, unknown>;
                params: Record<string, unknown>;
                headers: Record<string, unknown>;
                raw: { body: unknown };
              }) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                headers: req.headers,
                body: req.raw.body,
              }),
            },
            // Add timestamp
            timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
            // Configure Grafana Loki compatible format
            formatters: {
              level: (label) => {
                return { level: label };
              },
            },
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
