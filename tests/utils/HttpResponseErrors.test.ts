import { APIGatewayProxyResult } from 'aws-lambda';

import { baseHeaders } from '../../src/constants';
import { AppError, toHttpResponse } from '../../src/utils/HttpResponseErrors';

describe('AppError', () => {
  it('crea un AppError con valores por defecto', () => {
    const err = new AppError('Algo salió mal');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe('AppError');
    expect(err.message).toBe('Algo salió mal');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.details).toBeUndefined();
  });

  it('permite establecer statusCode, code y details', () => {
    const details = { field: 'email' };
    const err = new AppError('msg', 402, 'INVALID_INPUT', details);
    expect(err.statusCode).toBe(402);
    expect(err.code).toBe('INVALID_INPUT');
    expect(err.details).toEqual(details);
  });

  it('factory badRequest', () => {
    const err = AppError.badRequest('falta algo', { input: 'x' });
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('falta algo');
    expect(err.details).toEqual({ input: 'x' });
  });

  it('factory invalidInput', () => {
    const err = AppError.invalidInput('invalido', { field: 'age' });
    expect(err.statusCode).toBe(402);
    expect(err.code).toBe('INVALID_INPUT');
    expect(err.message).toBe('invalido');
    expect(err.details).toEqual({ field: 'age' });
  });

  it('factory notFound', () => {
    const err = AppError.notFound('no existe', { id: 123 });
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('no existe');
    expect(err.details).toEqual({ id: 123 });
  });

  it('factory internal', () => {
    const err = AppError.internal('boom', { traceId: 't-1' });
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe('boom');
    expect(err.details).toEqual({ traceId: 't-1' });
  });
});

describe('toHttpResponse', () => {
  it('mapea AppError a APIGatewayProxyResult con headers y body JSON', () => {
    const err = AppError.invalidInput('invalido', { field: 'email' });

    const res: APIGatewayProxyResult = toHttpResponse(err);

    expect(res.statusCode).toBe(402);
    expect(res.headers).toBe(baseHeaders);
    expect(() => JSON.parse(res.body)).not.toThrow();

    const body = JSON.parse(res.body);
    expect(body).toEqual({
      code: 'INVALID_INPUT',
      message: 'invalido',
      details: { field: 'email' },
    });
  });

  it('mapea Error genérico a 500 INTERNAL_ERROR', () => {
    const err = new Error('algo desconocido');
    const res = toHttpResponse(err);

    expect(res.statusCode).toBe(500);
    expect(res.headers).toBe(baseHeaders);

    const body = JSON.parse(res.body);
    expect(body).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });

  it('mapea valores desconocidos (no Error) a 500 INTERNAL_ERROR', () => {
    const res = toHttpResponse({ any: 'thing' } as any);

    expect(res.statusCode).toBe(500);
    expect(res.headers).toBe(baseHeaders);

    const body = JSON.parse(res.body);
    expect(body).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });
});
