import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';

/**
 * Creates a Grafana Loki compatible logger configuration
 * @param configService NestJS ConfigService
 * @returns Pino logger configuration for Grafana Loki
 */
export const createGrafanaLokiTransport = (configService: ConfigService) => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const serviceName = configService.get('SERVICE_NAME', 'auth-service');
  
  if (!isProduction) {
    return {
      target: 'pino-pretty',
      options: {
        singleLine: true,
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
      },
    };
  }

  // Grafana Loki configuration for production
  return {
    target: 'pino-loki',
    options: {
      batching: true,
      interval: 5,
      labels: { app: serviceName },
      host: configService.get('LOKI_HOST', 'http://loki:3100'),
      basicAuth: {
        username: configService.get('LOKI_USERNAME', ''),
        password: configService.get('LOKI_PASSWORD', ''),
      },
      // Add custom formatters for Grafana Loki
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
        bindings: (bindings: pino.Bindings) => {
          return { ...bindings };
        },
        log: (log: object) => {
          // Extract and format stack traces for better readability in Grafana
          if (log['err'] && log['err'].stack) {
            return {
              ...log,
              error: {
                message: log['err'].message,
                stack: log['err'].stack,
                type: log['err'].type || log['err'].name,
              },
            };
          }
          return log;
        },
      },
    },
  };
};
