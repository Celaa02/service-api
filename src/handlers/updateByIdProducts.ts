import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { updateByIdProductsDependencies } from '../case/useCaseUpdateByIdProducts/updateByIdProductsDepencies';
import { useCaseUpdateByIdProducts } from '../case/useCaseUpdateByIdProducts/useCaseUpdateByIdProduct';
import { updateByIdProductsHttpAdapter } from '../infrastructure/adapters/Products/updateByIdProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_, _404_NOT_FOUND_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { pathSchema } from './schemas/Products/updateByIdProductsSchemaHttp';

const factory = (): updateByIdProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, { pathSchema });
    logger.debug('✅ Validation passed', validated);
    const adapter = updateByIdProductsHttpAdapter(useCaseUpdateByIdProducts());

    const response = await adapter(event, dependencies);
    logger.info('✅ Update product id', response);

    if (response === null) {
      return _404_NOT_FOUND_({
        message: 'Product not in CREATED.',
        data: [],
      });
    }

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in update product id', { err });
    return toHttpResponse(err);
  }
};
