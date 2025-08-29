import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getByIdProductsDependencies } from '../case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { useCaseGetByIdProducts } from '../case/useCaseGetByIdProducts/useCaseGetByIdProducts';
import { getByIdProductsHttpAdapter } from '../infrastructure/adapters/Products/getByIdProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Products/getByIdProductsSchemaHttp';

const factory = (): getByIdProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = getByIdProductsHttpAdapter(useCaseGetByIdProducts());

    const response = await adapter(event, dependencies);
    logger.info('✅ Get product', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'The productsId does not exist or is not active.',
        data: [],
      });
    }
    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get products', { err });
    return toHttpResponse(err);
  }
};
