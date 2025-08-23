import { badRequest, created, internal } from "../constants";
import { ApiGatewayEvent, ApiGatewayResponse } from "../utils/ReponseHttp";

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const body = event?.body ? JSON.parse(event.body) : {};
    if (!body?.name) return badRequest("`name` is required");

    return created(body.name);
  } catch (err: any) {
    return internal(err?.message);
  }
};
