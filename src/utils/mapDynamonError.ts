import { AppError } from '../utils/HttpResponseErrors';

export function mapDynamoError(err: any): AppError {
  const name = err?.name || err?.Code || err?.code;
  const httpStatus = err?.$metadata?.httpStatusCode;
  const causeCode = err?.cause?.code;

  if (causeCode === 'ECONNREFUSED' || name === 'UnknownEndpoint') {
    return new AppError('DynamoDB unavailable', 503, 'SERVICE_UNAVAILABLE', {
      code: causeCode || name,
      endpoint: err?.hostname || err?.address,
      port: err?.port,
    });
  }

  if (name === 'ConditionalCheckFailedException') {
    return new AppError('Order already exists', 409, 'CONFLICT', {
      condition: 'attribute_not_exists(orderId)',
    });
  }

  if (name === 'ValidationException') {
    return AppError.invalidInput('DynamoDB validation error', err?.message);
  }

  if (name === 'ThrottlingException' || name === 'ProvisionedThroughputExceededException') {
    return new AppError('DynamoDB throttling', 429, 'THROTTLED', { retryable: true });
  }

  if (name === 'ResourceNotFoundException') {
    return new AppError('DynamoDB resource not found', 500, 'TABLE_NOT_FOUND', {
      table: process.env.ORDERS_TABLE_NAME,
    });
  }

  if (httpStatus && httpStatus >= 500) {
    return new AppError('DynamoDB internal error', 502, 'BAD_GATEWAY', { httpStatus });
  }
  if (httpStatus && httpStatus >= 400) {
    return AppError.invalidInput('DynamoDB request error', { httpStatus, message: err?.message });
  }

  return AppError.internal('Unknown DynamoDB error', {
    name,
    message: err?.message,
  });
}
