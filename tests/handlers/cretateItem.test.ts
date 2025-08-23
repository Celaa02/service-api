import { handler } from "../../src/handlers/createItem";
import { ApiGatewayEvent } from "../../src/utils/ReponseHttp";

describe("createItem handler", () => {
  const baseEvent: ApiGatewayEvent = {
    body: null,
    pathParameters: null,
    queryStringParameters: null,
  };

  it("debe retornar 201 (created) cuando 'name' viene en el body", async () => {
    const event: ApiGatewayEvent = {
      ...baseEvent,
      body: JSON.stringify({ name: "Test Item", data: { foo: "bar" } }),
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(201);
    expect(res.body).toBe(JSON.stringify("Test Item"));
    expect(res.headers).toBeDefined();
    expect(res.headers?.["Content-Type"]).toBe("application/json");
  });

  it("debe retornar 400 (badRequest) cuando falta 'name'", async () => {
    const event: ApiGatewayEvent = {
      ...baseEvent,
      body: JSON.stringify({ data: { foo: "bar" } }),
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: "`name` is required" });
  });

  it("debe retornar 500 (internal) cuando el body no es JSON válido", async () => {
    const event: ApiGatewayEvent = {
      ...baseEvent,
      body: "{ invalid_json: true ",
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(500);
    const payload = JSON.parse(res.body);
    expect(payload).toHaveProperty("error");
    expect(typeof payload.error).toBe("string");
  });
});
