# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A NestJS + TypeORM + PostgreSQL REST API for a Teslo-branded shop: products (with one-to-many images), file upload for product images, JWT-based auth, and a database seed loader. Swagger docs are auto-generated. Package manager is Yarn (per README), though both `package-lock.json` and `yarn.lock` are present.

## Commands

```bash
yarn start:dev          # run with watch mode (primary dev loop)
yarn start:debug        # watch mode + --inspect debugger
yarn build              # nest build
yarn start:prod         # run compiled dist/main
yarn lint               # eslint --fix over src/apps/libs/test
yarn format             # prettier --write src/** test/**

yarn test               # jest unit tests (*.spec.ts under src/)
yarn test:watch
yarn test:cov
yarn test:e2e           # e2e tests via test/jest-e2e.json
yarn test:debug         # jest --runInBand under node inspector

# run a single unit test file
yarn test src/products/products.service.spec.ts
# run tests matching a name
yarn test -t "should create a product"
```

Database (Docker Postgres, data persisted to `./postgres`):
```bash
docker-compose up -d     # start Postgres (container: testPostgres, port 5432)
docker-compose down
docker-compose logs db
```

Env vars come from `.env` (see `.env.template`): `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `PORT`. `JWT_SECRET` and `HOST_API` are also required (read via `ConfigService.getOrThrow` in `AuthModule` and used in `FilesController` for building image URLs) but are not listed in `.env.template` — add them to `.env` when working on auth or file upload.

Seed the database (server must be running): `GET http://localhost:3000/api/seed` — wipes all products/images and reinserts fixture data from `src/seed/data/seed-data.ts`.

## Performance & Non-Blocking Operations

**Event Loop Safety:** All I/O operations have been optimized to avoid blocking the Node.js event loop:
- `bcrypt.hash()` (async) instead of `bcrypt.hashSync()` — prevents blocking during password hashing (100-200ms per operation)
- `fs.promises.access()` (async) instead of `existsSync()` — allows concurrent image downloads without blocking
- `QueryRunner` transactions use a guaranteed `finally` block to release DB connections even on error — prevents connection pool exhaustion under load

These optimizations ensure the server remains responsive under high concurrency.

## Architecture

**Global setup** (`src/main.ts`): global prefix `api`, global `ValidationPipe` with `whitelist: true` + `forbidNonWhitelisted: true` (unknown/extra body fields are rejected — DTOs must declare every accepted field), and Swagger mounted at `api/doc`.

**Module graph** (`src/app.module.ts`): `TypeOrmModule.forRootAsync` reads DB config from `ConfigService` with `autoLoadEntities: true` and `synchronize: true` (schema auto-syncs from entities — no migrations in this project). `ServeStaticModule` serves a root path, but actual product image files live under `./static/products` and are served instead through the `FilesModule`'s own controller route (see below) — the `ServeStaticModule` `rootPath` (`assets`) is not where uploads land, don't assume static file serving works through it.

**Products** (`src/products/`): `Product` 1—N `ProductImage` (`cascade: true, eager: true` on the `Product.images` relation, `onDelete/onUpdate: CASCADE` on the FK side), and ManyToOne with `User` (`nullable: false`, every product must be owned by a user). Both `Product` and `ProductImage` entities self-generate UUIDv7 ids in `@BeforeInsert` hooks rather than relying on a DB default — keep that pattern when adding entities that need UUIDv7 PKs. `Product` also derives/normalizes its `slug` from `title` in `@BeforeInsert`/`@BeforeUpdate`. `ProductsService.findOne(term)` accepts a UUID, exact title, or slug — check `isUUID()` first, else query by `title OR slug`. `ProductsService.create()` and `ProductsService.update()` both require a `User` parameter to associate the product with its owner. Product updates run inside an explicit `QueryRunner` transaction with a guaranteed `finally` block that releases the connection — this prevents connection leaks even if `connect()` or `startTransaction()` fail. Unique-constraint violations (Postgres error code `23505`) are translated to `400` centrally.

**Common** (`src/common/`): `CommonService.handlerException(err)` is the shared DB-error-to-HTTP-exception translator (23505 → `BadRequestException`, everything else logged and rethrown as `InternalServerErrorException`); most services call this in `.catch()`/`catch` blocks instead of handling Postgres errors inline. Note `src/common/helpers/handle-db-exceptions.helper.ts` is an older duplicate of the same logic — prefer `CommonService.handlerException` for new code. `PaginationDto` (`limit`/`offset`, coerced to `Number` via `class-transformer`) is the standard list-endpoint query DTO.

**Auth** (`src/auth/`): Passport JWT strategy (`JwtStrategy`) extracts a Bearer token, validates the payload against the `users` table, and rejects if the user doesn't exist or `isActive` is false. Protect routes with `@UseGuards(AuthGuard())` and pull the authenticated user via `@GetUserDecorator()` (throws 500 if `request.user` is missing, i.e. guard wasn't applied). Passwords are hashed with bcrypt (`saltOrRounds = 10`) **using async `bcrypt.hash()` to avoid blocking the event loop**; `password` column has `select: false` so it must be explicitly selected (see `AuthService.login`). `UserRoleGuard` (`src/auth/guards/user-role/user-role.guard.ts`) currently always returns `true` — it's a stub, not a working role check; don't assume role-based authorization is enforced anywhere yet.

**Files** (`src/files/`): Product images are uploaded via `POST /api/files/product` (multipart, field `file`) using `multer` `diskStorage` writing to `./static/products` with UUIDv7-based filenames (`fileNamer` helper, derives extension from mimetype). Validated with `ParseFilePipe` (10 MB max, jpeg/jpg/png/gif only, magic-number check skipped). The response's `secureUrl` is built from `HOST_API` env var + the static path — this is the URL meant to be stored in a product's `images` array. Retrieval is via `GET /api/files/product/:name`, which resolves the file from `./static/products` relative to `dist/` at runtime. `FilesService.getStaticProductImage()` is **async** (uses `fs.promises.access()` instead of `existsSync()` to avoid blocking the event loop) and 404s if the file is missing. The controller method `findProductImage()` is also async and properly awaits the service call.

**Seed** (`src/seed/`): `GET /api/seed` calls `ProductsService.removeAll()` then bulk-inserts fixtures from `seed-data.ts` through `ProductsService.create()` (not raw inserts), so seed data goes through the same validation/slug-generation path as the API.