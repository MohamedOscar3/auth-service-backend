import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';

/**
 * Creates a Grafana Loki compatible logger configuration
 * @param configService NestJS ConfigService
 * @returns Pino logger configuration for Grafana Loki
 */
export const createGrafanaLokiTransport = (configService: ConfigService) => {
  const isProduction: boolean =
    configService.get<string>('NODE_ENV') === 'production';
  const serviceName: string = configService.get('SERVICE_NAME', 'auth-service');

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
      host: configService.get<string>('LOKI_HOST', 'http://loki:3100'),
      basicAuth: {
        username: configService.get<string>('LOKI_USERNAME', ''),
        password: configService.get<string>('LOKI_PASSWORD', ''),
      },
      // Add custom formatters for Grafana Loki
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
        bindings: (bindings: pino.Bindings) => {
          // Safe spread of bindings object
          return { ...bindings } as Record<string, unknown>;
        },
        log: (log: Record<string, unknown>) => {
          // Extract and format stack traces for better readability in Grafana
          // Safely extract error information with proper type checking
          const err = log['err'];
          if (err && typeof err === 'object' && err !== null) {
            const errorObj = err as Record<string, unknown>;
            const stack = errorObj.stack as string | undefined;
            const message = errorObj.message as string | undefined;
            const type =
              (errorObj.type as string | undefined) ||
              (errorObj.name as string | undefined);

            return {
              ...log,
              error: {
                message: message || 'Unknown error',
                stack: stack || '',
                type: type || 'Error',
              },
            };
          }
          return log;
        },
      },
    },
  };
};
