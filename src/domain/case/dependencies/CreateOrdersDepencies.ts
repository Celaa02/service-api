import { Logger } from 'winston';

export type createOrdersDependencies<T = unknown> = {
  repository: T;
  logger: Logger;
};
