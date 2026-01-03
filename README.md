# SolidarianID - MISUM 2025

> Grupo 2: Roberto Burruezo, Raúl González, Paula Sempere, Ángel Pérez

## Base de datos

Las consultas principales del sistema se han extraído en archivos SQL ubicados en `database/queries/`. El archivo `database/init.sql` prepara el esquema e inserta datos de prueba.

Es posible ejecutar las consultas de forma sencilla mediante el "Query Explorer" (necesario Docker):

```bash
./scripts/start-queries-explorer.sh
```

## Arquitectura

El proyecto NestJS se divide en tres componentes:

- `apps/solidarianid`: aplicación principal "core" (puerto `3000`).
- `apps/admin`: aplicación de administración (puerto `3001`).
- `libs/shared`: librería compartida (módulos comunes, utilidades...).

## Configuración

Es posible configurar cada componente mediante variables de entorno. Se proporciona un archivo `.env.example` con la configuración mínima necesaria.

| Variable                 | Tipo     | Descripción                                             | Valor por defecto |
| ------------------------ | -------- | ------------------------------------------------------- | ----------------- |
| `DB_HOST`                | `string` | Host de Postgres                                        | -                 |
| `DB_PORT`                | `number` | Puerto de Postgres                                      | `5432`            |
| `DB_USER`                | `string` | Usuario de Postgres                                     | -                 |
| `DB_PASSWORD_FILE`       | `string` | Ruta del fichero que contiene la contraseña de Postgres | -                 |
| `DB_NAME`                | `string` | Nombre de Postgres                                      | -                 |
| `RABBITMQ_HOST`          | `string` | Host de RabbitMQ                                        | -                 |
| `RABBITMQ_PORT`          | `number` | Puerto de RabbitMQ                                      | `5672`            |
| `RABBITMQ_USER`          | `string` | Usuario de RabbitMQ                                     | -                 |
| `RABBITMQ_PASSWORD_FILE` | `string` | Ruta del fichero que contiene la contraseña de RabbitMQ | -                 |
| `RABBITMQ_QUEUE`         | `string` | Nombre de la cola en RabbitMQ                           | -                 |

### Aplicación: solidarianid

Configuración específica de la aplicación principal:

| Variable    | Tipo     | Descripción               | Valor por defecto |
| ----------- | -------- | ------------------------- | ----------------- |
| `REDIS_URL` | `string` | URL de la instancia Redis | -                 |

### Aplicación: admin

Configuración específica de la aplicación de administración:

| Variable              | Tipo     | Descripción                                                         | Valor por defecto |
| --------------------- | -------- | ------------------------------------------------------------------- | ----------------- |
| `SESSION_SECRET_FILE` | `string` | Ruta del fichero que contiene el valor secreto para firmar sesiones | -                 |

## Desarrollo

Para facilitar el desarrollo se ha incluido un archivo `docker-compose.dev.yml` que incluye los elementos necesarios para trabajar localmente:

```bash
# Crear archivo de configuración del entorno
cp .env.example .env

# Crear secretos con contenido aleatorio
openssl rand -base64 32 | tr -d '\n' > secrets/solidarian_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/admin_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/admin_session_secret.txt
openssl rand -base64 32 | tr -d '\n' > secrets/rabbitmq_password.txt

# Levantar la infraestructura local
docker compose -f docker-compose.dev.yml up -d --wait

# Instalar dependencias
npm install

# Lanzar una aplicación
npm run start:dev:solidarianid
# ó npm run start:dev:admin
```
