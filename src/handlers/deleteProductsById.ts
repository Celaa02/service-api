import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { useCaseDeleteByIdProducts } from '../case/useCaseDeleteByIdProducts/useCaseDeleteByIdProducts';
import { getByIdProductsDependencies } from '../case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { deleteByIdProductsHttpAdapter } from '../infrastructure/adapters/Products/deleteByIdProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Products/deleteByIdProductsSchemaHttp';

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
    const adapter = deleteByIdProductsHttpAdapter(useCaseDeleteByIdProducts());

    const response = await adapter(event, dependencies);
    logger.info('✅ Delete product', response);

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in get products', { err });
    return toHttpResponse(err);
  }
};
