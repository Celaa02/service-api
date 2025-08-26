import { baseHeaders } from '../../src/constants';
import {
  _200_OK_,
  _201_CREATED_,
  _204_NO_CONTENT_,
  _400_BAD_REQUEST_,
  _402_INPUT_INVALIT_,
  _404_NOT_FOUND_,
  _500_INTERNAL_SERVER_ERROR_,
} from '../../src/utils/HttpResponse';

describe('HttpResponse helpers', () => {
  const payload = { foo: 'bar' };

  it('_200_OK_ should return 200 response with body and headers', () => {
    const result = _200_OK_(payload);
    expect(result).toEqual({
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });

  it('_200_OK_ should allow overriding statusCode', () => {
    const result = _200_OK_(payload, 202);
    expect(result.statusCode).toBe(202);
  });

  it('_201_CREATED_ should return 201 response', () => {
    const result = _201_CREATED_(payload);
    expect(result).toEqual({
      statusCode: 201,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });

  it('_204_NO_CONTENT_ should return 204 response with empty body', () => {
    const result = _204_NO_CONTENT_(payload);
    expect(result).toEqual({
      statusCode: 204,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });

  it('_400_BAD_REQUEST_ should return 400 response', () => {
    const result = _400_BAD_REQUEST_(payload);
    expect(result).toEqual({
      statusCode: 400,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });

  it('_402_INPUT_INVALIT_ should return 402 response', () => {
    const result = _402_INPUT_INVALIT_(payload);
    expect(result).toEqual({
      statusCode: 402,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });

  it('_404_NOT_FOUND_ should return 404 response', () => {
    const result = _404_NOT_FOUND_(payload);
    expect(result).toEqual({
      statusCode: 404,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });

  it('_500_INTERNAL_SERVER_ERROR_ should return 500 response', () => {
    const result = _500_INTERNAL_SERVER_ERROR_(payload);
    expect(result).toEqual({
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
  });
});
