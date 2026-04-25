# SolidarianID - MISUM 2025

> Grupo 2: Roberto Burruezo, Raúl González, Paula Sempere, Ángel Pérez

## Arquitectura

El proyecto se divide en múltiples componentes:

- `apps/core`: aplicación NestJS principal (puerto `3000`).
- `apps/admin`: aplicación NestJS de administración (puerto `3001`).
- `apps/identity`: aplicación NestJS de identidad (puerto `3002`).
- `apps/gateway`: pasarela de API NestJS (puerto `3010`).
- `apps/front`: aplicación NextJS principal (front-end, puerto `3080`).
- `libs/shared`: librería compartida (módulos comunes, utilidades...).

## Configuración NestJS

Es posible configurar cada componente back-end mediante variables de entorno. Se proporciona un archivo `.env.example` con la configuración mínima necesaria.

| Variable            | Tipo     | Descripción                                             | Valor por defecto |
| ------------------- | -------- | ------------------------------------------------------- | ----------------- |
| `DB_HOST`           | `string` | Host de Postgres                                        | -                 |
| `DB_PORT`           | `number` | Puerto de Postgres                                      | `5432`            |
| `DB_USER`           | `string` | Usuario de Postgres                                     | -                 |
| `DB_PASSWORD_FILE`  | `string` | Ruta del fichero que contiene la contraseña de Postgres | -                 |
| `DB_NAME`           | `string` | Nombre de Postgres                                      | -                 |
| `NATS_URL`          | `string` | URL de NATS                                             | -                 |
| `CORE_GRPC_URL`     | `string` | URL en la que `core` escucha peticiones gRPC            | `localhost:5002`  |
| `IDENTITY_GRPC_URL` | `string` | URL en la que `identity` escucha peticiones gRPC        | `localhost:5003`  |

### Aplicación: gateway

Configuración específica de la pasarela de API:

| Variable               | Tipo     | Descripción                                                  | Valor por defecto                            |
| ---------------------- | -------- | ------------------------------------------------------------ | -------------------------------------------- |
| `CORE_URL`             | `string` | URL interna del microservicio core                           | `http://localhost:3000`                      |
| `CORS_ORIGIN`          | `string` | Origen permitido para CORS                                   | `*`                                          |
| `JWT_SECRET_FILE`      | `string` | Ruta del fichero que contiene el secreto para firmar JWT     | -                                            |
| `JWT_EXPIRATION`       | `string` | Tiempo de expiración del JWT (formato `ms`, e.g. `7d`, `1h`) | `7d`                                         |
| `GOOGLE_CLIENT_ID`     | `string` | Client ID de Google OAuth 2.0                                | -                                            |
| `GOOGLE_CLIENT_SECRET` | `string` | Client Secret de Google OAuth 2.0                            | -                                            |
| `GOOGLE_CALLBACK_URL`  | `string` | URL de callback de Google OAuth                              | `http://localhost:3010/auth/google/callback` |
| `FRONTEND_URL`         | `string` | URL del frontend (redirección post-OAuth)                    | `http://localhost:3080`                      |

### Aplicación: core

Configuración específica de la aplicación principal:

| Variable                     | Tipo     | Descripción                                         | Valor por defecto |
| ---------------------------- | -------- | --------------------------------------------------- | ----------------- |
| `REDIS_URL`                  | `string` | URL de la instancia Redis                           | -                 |
| `KURRENTDB_URL`              | `string` | URL de conexión a KurrentDB                         | -                 |
| `STRIPE_SK`                  | `string` | Clave secreta de Stripe                             | -                 |
| `STRIPE_PAYMENT_SUCCESS_URL` | `string` | URL de redirección tras completar un pago en Stripe | -                 |

### Aplicación: admin

Configuración específica de la aplicación de administración:

| Variable              | Tipo     | Descripción                                                         | Valor por defecto |
| --------------------- | -------- | ------------------------------------------------------------------- | ----------------- |
| `SESSION_SECRET_FILE` | `string` | Ruta del fichero que contiene el valor secreto para firmar sesiones | -                 |

### Aplicación: frontend

Configuración específica de la aplicación de frontend:

| Variable                  | Tipo     | Descripción                    | Valor por defecto     |
| ------------------------- | -------- | ------------------------------ | --------------------- |
| `NEXTAUTH_URL`            | `string` | URL del microservicio frontend | -                     |
| `NEXTAUTH_SECRET`         | `string` | Secreto de NextAuth            | -                     |
| `NEXT_PUBLIC_GATEWAY_URL` | `string` | URL del microservicio gateway  | http://localhost:3010 |

## Desarrollo

Para facilitar el desarrollo se ha incluido un archivo `docker-compose.dev.yml` que incluye los elementos necesarios para trabajar localmente:

```bash
# Crear archivo de configuración del entorno
cp .env.example .env

# Crear secretos con contenido aleatorio
openssl rand -base64 32 | tr -d '\n' > secrets/core_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/identity_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/admin_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/admin_session_secret.txt
openssl rand -base64 32 | tr -d '\n' > secrets/jwt_secret.txt

# Levantar la infraestructura local
docker compose -f docker-compose.dev.yml up -d --wait

# Instalar dependencias
npm install

# Generar el código desde Protobuffers (Linux/Mac)
npm run proto:gen
# npm run proto:gen:win (Windows)

# Lanzar las aplicaciones backend
npm run start:dev:core
# ó npm run start:dev:admin
# ó npm run start:dev:identity
# ó npm run start:dev:gateway
```

La aplicación front-end puede lanzarse mediante el comando:

```bash
npm run start:dev:front
```

## Testing

Es posible realizar pruebas básicas mediante los siguientes comandos:

- Linting: `npm run lint`
- Tests unitarios: `npm run test`

### Tests de integración

Se proporciona un archivo `docker-compose.test.yml` específico para apoyar los tests de integración (e2e en NestJS).

```bash
# Levantar la infraestructura
docker compose -f docker-compose.test.yml up -d --wait

# Ejecutar tests de integración
npm run test:e2e

# Detener servicios
docker compose -f docker-compose.test.yml down
```
