import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createProductsDependencies } from '../case/useCaseCreateProducts/CreateProductsDepencies';
import { useCaseListProducts } from '../case/useCaseListProducts/useCaseListProducts';
import { listProductsHttpAdapter } from '../infrastructure/adapters/Products/listProductsAdaptersHttp';
import { ProductRepositoryDynamoDB } from '../infrastructure/repository/productsRepository';
import { _200_OK_ } from '../utils/HttpResponse';
import { toHttpResponse } from '../utils/HttpResponseErrors';
import { logger } from '../utils/Logger';

const factory = (): createProductsDependencies => ({
  repository: new ProductRepositoryDynamoDB(),
  logger,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dependencies = factory();
  dependencies.logger.info('📥 Incoming request', { event });

  try {
    const adapter = listProductsHttpAdapter(useCaseListProducts());
    const response = await adapter(event, dependencies);
    logger.debug('✅ List products ', response);

    return _200_OK_(response);
  } catch (err) {
    logger.error('❌ Error in list products', { err });
    return toHttpResponse(err);
  }
};
