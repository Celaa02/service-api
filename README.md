# AWS CRUD API (Serverless + Node.js 18 + Clean Architecture)

Proyecto base con **Serverless Framework**, **TypeScript**, **Node.js 18** y **arquitectura limpia**.

## Scripts

- `npm run dev` → ejecutar en local con serverless-offline
- `npm run deploy:dev` → desplegar a AWS (stage dev)
- `npm run deploy:prod` → desplegar a AWS (stage prod)
- `npm test` → correr pruebas con Jest

## Estructura

- `src/domain` → entidades y repositorios (reglas de negocio puras)
- `src/application` → casos de uso (a implementar)
- `src/infrastructure` → integración con AWS (a implementar)
