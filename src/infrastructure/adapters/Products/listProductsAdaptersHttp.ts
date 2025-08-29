import { APIGatewayProxyEvent } from 'aws-lambda';

import { listProductsDependencies } from '../../../case/useCaseListProducts/listProductsDepencies';
import { listProductsType } from '../../../case/useCaseListProducts/listProductsType';

export const listProductsHttpAdapter =
  (doCase: listProductsType) =>
  async (event: APIGatewayProxyEvent, dependencies: listProductsDependencies) => {
    dependencies.logger.info(event);
    const response = await doCase(dependencies);
    return response;
  };
