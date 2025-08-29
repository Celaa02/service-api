import { createLogger, format, transports } from 'winston';

const isLocal = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'dev';

const level = process.env.LOG_LEVEL?.toLowerCase?.() || (isLocal ? 'debug' : 'info');

export const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    isLocal ? format.colorize() : format.uncolorize(),
    isLocal
      ? format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`,
        )
      : format.json(),
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
      stderrLevels: ['error'],
      consoleWarnLevels: ['warn'],
      silent: false,
    }),
  ],
});
