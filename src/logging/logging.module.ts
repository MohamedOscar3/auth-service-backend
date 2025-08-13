import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
            redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],
            // Add request context
            customProps: (req) => {
              const user = (req as any).user;
              return {
                correlationId: req.id,
                userId: user?.userId || 'anonymous',
              };
            },
            // Custom serializers
            serializers: {
              req: (req) => ({
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
