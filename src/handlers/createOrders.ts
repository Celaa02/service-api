import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { _201_CREATED_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { validationHttps } from '../utils/ValidationsHttps';
import { createOrdersSchema } from './schemas/createOrdersSchemaHttp';
import { logger } from '../utils/Logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, createOrdersSchema);
    logger.debug('✅ Validation passed', validated);
    const res = _201_CREATED_(validated);
    logger.info('✅ sent response', res);
    return res;
  } catch (err) {
    logger.error('❌ Error in createOrder', { err });
    return toHttpResponse(err);
  }
};
