import { ApiGatewayEvent } from "./utilsResponse";

export const validationHttps = async (event: ApiGatewayEvent) => {
  if (event.body != null && event.body !== "") {
    return JSON.parse(event.body);
  } else if (event.pathParameters && Object.keys(event.pathParameters).length) {
    return event.pathParameters;
  } else if (event.queryStringParameters && Object.keys(event.queryStringParameters).length) {
    return event.queryStringParameters;
  } else {
    return false;
  }
};
