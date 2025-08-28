import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createProductsDependencies } from '../case/useCaseCreateProducts/CreateProductsDepencies';
import { useCaseCreateProducts } from '../case/useCaseCreateProducts/useCaseCreateProducts';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _201_CREATED_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';
import { validationHttps } from '../utils/ValidationsHttps';
import { createProductsSchema } from './schemas/Products/createProductsSchemaHttp';
import { createProductsHttpAdapter } from '../infrastructure/adapters/Products/createProductsAdaptersHttp';

const factory = (): createProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const validated = await validationHttps(event, createProductsSchema);
    logger.debug('✅ Validation passed', validated);
    const adapter = createProductsHttpAdapter(useCaseCreateProducts());

    const response = await adapter(event, dependencies);
    logger.debug('✅ Products created ', response);

    return _201_CREATED_(response);
  } catch (err) {
    logger.error('❌ Error in products create', { err });
    return toHttpResponse(err);
  }
};
