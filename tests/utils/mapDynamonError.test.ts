import { AppError } from '../../src/utils/HttpResponseErrors';
import { mapDynamoError } from '../../src/utils/mapDynamonError';

describe('mapDynamoError', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('mapea ECONNREFUSED a SERVICE_UNAVAILABLE (503)', () => {
    const err = {
      name: 'Error',
      cause: { code: 'ECONNREFUSED' },
      hostname: '127.0.0.1',
      port: 8000,
    };

    const mapped = mapDynamoError(err);
    expect(mapped).toBeInstanceOf(AppError);
    expect(mapped.statusCode).toBe(503);
    expect(mapped.code).toBe('SERVICE_UNAVAILABLE');
    expect(mapped.message).toBe('DynamoDB unavailable');
    expect(mapped.details).toEqual({
      code: 'ECONNREFUSED',
      endpoint: '127.0.0.1',
      port: 8000,
    });
  });

  it('mapea UnknownEndpoint a SERVICE_UNAVAILABLE (503)', () => {
    const err = { name: 'UnknownEndpoint', address: 'localhost', port: 8000 };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(503);
    expect(mapped.code).toBe('SERVICE_UNAVAILABLE');
    expect(mapped.details).toEqual({
      code: 'UnknownEndpoint',
      endpoint: 'localhost',
      port: 8000,
    });
  });

  it('mapea ConditionalCheckFailedException a CONFLICT (409)', () => {
    const err = { name: 'ConditionalCheckFailedException' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(409);
    expect(mapped.code).toBe('CONFLICT');
    expect(mapped.message).toBe('Order already exists');
    expect(mapped.details).toEqual({
      condition: 'attribute_not_exists(orderId)',
    });
  });

  it('mapea ValidationException a INVALID_INPUT (402)', () => {
    const err = { name: 'ValidationException', message: 'Bad attribute' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(402);
    expect(mapped.code).toBe('INVALID_INPUT');
    expect(mapped.message).toBe('DynamoDB validation error');
    expect(mapped.details).toBe('Bad attribute');
  });

  it('mapea ThrottlingException a THROTTLED (429)', () => {
    const err = { name: 'ThrottlingException' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(429);
    expect(mapped.code).toBe('THROTTLED');
    expect(mapped.message).toBe('DynamoDB throttling');
    expect(mapped.details).toEqual({ retryable: true });
  });

  it('mapea ProvisionedThroughputExceededException a THROTTLED (429)', () => {
    const err = { name: 'ProvisionedThroughputExceededException' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(429);
    expect(mapped.code).toBe('THROTTLED');
    expect(mapped.details).toEqual({ retryable: true });
  });

  it('mapea ResourceNotFoundException a TABLE_NOT_FOUND (500) usando ORDERS_TABLE_NAME', () => {
    process.env.ORDERS_TABLE_NAME = 'aws-crud-api-dev-orders';
    const err = { name: 'ResourceNotFoundException' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(500);
    expect(mapped.code).toBe('TABLE_NOT_FOUND');
    expect(mapped.message).toBe('DynamoDB resource not found');
    expect(mapped.details).toEqual({ table: 'aws-crud-api-dev-orders' });
  });

  it('mapea httpStatus >= 500 a BAD_GATEWAY (502)', () => {
    const err = { $metadata: { httpStatusCode: 503 } };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(502);
    expect(mapped.code).toBe('BAD_GATEWAY');
    expect(mapped.message).toBe('DynamoDB internal error');
    expect(mapped.details).toEqual({ httpStatus: 503 });
  });

  it('mapea httpStatus >= 400 a INVALID_INPUT (402)', () => {
    const err = { $metadata: { httpStatusCode: 400 }, message: 'bad request' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(402);
    expect(mapped.code).toBe('INVALID_INPUT');
    expect(mapped.message).toBe('DynamoDB request error');
    expect(mapped.details).toEqual({ httpStatus: 400, message: 'bad request' });
  });

  it('mapea desconocidos a INTERNAL_ERROR (500)', () => {
    const err = { name: 'WeirdError', message: 'something odd' };

    const mapped = mapDynamoError(err);
    expect(mapped.statusCode).toBe(500);
    expect(mapped.code).toBe('INTERNAL_ERROR');
    expect(mapped.message).toBe('Unknown DynamoDB error');
    expect(mapped.details).toEqual({
      name: 'WeirdError',
      message: 'something odd',
    });
  });
});
