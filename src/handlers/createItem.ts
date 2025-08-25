import {
  _400_BAD_REQUEST_,
  _201_CREATED_,
  _500_INTERNAL_SERVER_ERROR_,
  _402_INPUT_INVALIT_,
} from "../utils/HttpResponse";
import { ApiGatewayEvent, ApiGatewayResponse } from "../utils/utilsResponse";
import { validationHttps } from "../utils/ValidationsHttps";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  console.log("🚀 ~ handler ~ event:", event);
  try {
    const validate = validationHttps(event);
    console.log("🚀 ~ handler ~ validate:", validate);
    if (!validate) {
      return _402_INPUT_INVALIT_(validate);
    }
    const body = event?.body ? JSON.parse(event.body) : {};
    if (!body?.name) return _400_BAD_REQUEST_("`name` is required");

    return _201_CREATED_(body.name);
  } catch (err: unknown) {
    return _500_INTERNAL_SERVER_ERROR_(err);
  }
};
