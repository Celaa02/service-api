<p align="center">
  <a href="https://aws.amazon.com/lambda/" target="_blank">
    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/AWS_Lambda_logo.svg" width="200" alt="AWS Lambda Logo">
  </a>
</p>

<p align="center">
<a href="https://github.com/tuusuario/turepo/actions"><img src="https://github.com/tuusuario/turepo/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="#"><img src="https://img.shields.io/github/license/tuusuario/turepo" alt="License"></a>
<a href="#"><img src="https://img.shields.io/github/v/release/tuusuario/turepo" alt="Latest Version"></a>
</p>

# 🛒 Orders & Products API - Backend Serverless (Node.js + AWS)

Este servicio gestiona la lógica principal de la API:

- Gestión de **productos** (crear, actualizar, eliminar, listar).
- Gestión de **órdenes** (crear, obtener por ID, listar por usuario, confirmar).
- Manejo centralizado de **validaciones, logs y errores**.
- Arquitectura basada en **Clean Architecture** para mayor mantenibilidad.

Desplegado en **AWS Lambda** usando **Serverless Framework**.

---

## 🚀 Tecnologías usadas

- [Node.js + TypeScript](https://nodejs.org/) - Lenguaje principal
- [AWS Lambda](https://aws.amazon.com/lambda/) - Ejecución sin servidores
- [AWS API Gateway](https://aws.amazon.com/api-gateway/) - Punto de entrada a la API
- [DynamoDB](https://aws.amazon.com/dynamodb/) - Base de datos NoSQL
- [Serverless Framework](https://www.serverless.com/) - Infraestructura como código
- [Swagger / OpenAPI](https://swagger.io/specification/) - Documentación de API
- [GitHub](https://github.com/) - Plataforma para Alojar el proyecto.

---

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/Celaa02/alegra-kitchen
cd alegra_kitchen
```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz:

```env
  STAGE=dev
  IS_OFFLINE=true
  LOG_LEVEL=debug

  ORDERS_TABLE_NAME=OrdersTable
  PRODUCTS_TABLE_NAME=ProductsTable
  AWS_REGION=us-east-1
```

4. Ejecuta el servidor.

```npm run dev

```

---

## 🧪 Scripts disponibles

```bash
# Levantar entorno local con serverless-offline
unset AWS_PROFILE AWS_SESSION_TOKEN
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local
export AWS_REGION=us-east-1
export FORCE_LOCAL=true
export DYNAMO_ENDPOINT=http://127.0.0.1:8000

npx serverless offline --stage dev

# Ejecutar pruebas unitarias con Jest
npm run test

# Generar reporte de cobertura
npm run test:coverage
```

---

## 🌐 Despliegue en AWS

```bash
# Desplegar a AWS (stage dev)
npx serverless deploy --stage dev --region $AWS_REGION

# Desplegar a AWS (stage prod)
npx serverless deploy --stage prod --region $AWS_REGION
```

---

## 🧾 Endpoints principales

| Método | Ruta                        | Descripción                              |
| ------ | --------------------------- | ---------------------------------------- |
| POST   | `/products`                 | Crear producto                           |
| GET    | `/products`                 | Listar productos                         |
| GET    | `/products/{productId}`     | Obtener producto por ID                  |
| PUT    | `/products/{productId}`     | Actualizar producto por ID               |
| DELETE | `/products/{productId}`     | Eliminar producto por ID                 |
| POST   | `/orders`                   | Crear orden                              |
| GET    | `/orders/{id}`              | Obtener orden por ID                     |
| GET    | `/users/{userId}/orders`    | Listar órdenes de un usuario             |
| PATCH  | `/orders/{orderId}/confirm` | Confirmar una orden (cambia a CONFIRMED) |

---

---

## 📑 Documentacion disponible

- [Swagger UI - docs](https://celaa02.github.io/service-api/#/) - (public/openapi.yaml) Documentacion/Coffee Shop API

---

## 🔗 Despliegue

**URL base de producción**:

- [Coffee Shop](https://50tebmulz5.execute-api.us-east-1.amazonaws.com/prod/orders/) - Url de servicio

**URL base de desarrollo**:

- [Coffee Shop](https://vl3dwdespl.execute-api.us-east-1.amazonaws.com/dev/orders/) - Url de servicio.

---

## 🧠 Notas

- El proyecto sigue Clean Architecture:
  -- Domain: contratos y modelos.
  -- Use Cases: lógica de negocio.
  -- Infrastructure: repositorios DynamoDB.
  -- Adapters/Handlers: integración con API Gateway.
- Errores centralizados con AppError y toHttpResponse.
- Logs gestionados con Winston.
- Validaciones con Joi antes de llegar a la lógica de negocio.

---

## 🚀 CI/CD con GitHub Actions

Este proyecto utiliza **GitHub Actions** para automatizar:

- **CI (Integración Continua)**:
  - Instala dependencias
  - Ejecutar pruebas unitarias
  - Validar cobertura

- **CD (Despliegue Continuo)**:
  - Despliegue automático a AWS Lambda en cada merge a main.

### Workflows principales:

- `.github/workflows/develop-dev.yml` → corre en PR hacia hacia `develop`
- `.github/workflows/develop-prod.yml` → corre en merge hacia `main`

## 📸 Workflows en GitHub Actions

![Workflows](docs/images/workflows.png)

---

Made with ❤️ by [Celaa02](https://github.com/Celaa02/service-api)
