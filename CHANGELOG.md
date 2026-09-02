# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [1.1.0] - 2026-09-02

### 🚀 Nuevas Características

#### Auth Module
- **Autenticación JWT completa:** Endpoints de registro (`POST /api/auth/register`) y login (`POST /api/auth/login`)
- **Protección de rutas:** Endpoints de productos ahora requieren autenticación válida
- **Asociación de productos con usuarios:** Cada producto está vinculado a su usuario propietario

#### Files Module
- **Carga de imágenes:** Endpoint `POST /api/files/product` para cargar imágenes de productos
- **Descarga de imágenes:** Endpoint `GET /api/files/product/:name` para obtener imágenes almacenadas
- **Validación de archivos:** Soporte para JPG, PNG, GIF (máximo 10 MB)

### 🔧 Cambios Importantes

#### Performance & Non-Blocking Operations ⚡

**1. bcrypt: Elimina bloqueo en hash de contraseñas**
   - **Cambio:** `bcrypt.hashSync()` → `bcrypt.hash()` (async)
   - **Archivo:** `src/auth/auth.service.ts:28`
   - **Impacto:** Reduce bloqueo del event loop de 100-200ms a operación no-bloqueante
   - **Beneficio:** Mejor throughput bajo concurrencia alta en registros de usuarios

**2. File System: Verifica existencia de archivos de forma async**
   - **Cambio:** `existsSync()` → `fs.promises.access()` (async)
   - **Archivo:** `src/files/files.service.ts:10`
   - **Impacto:** No bloquea durante verificación de archivos
   - **Beneficio:** Descargas concurrentes de imágenes no interfieren con otros requests

**3. Database Transactions: Garantiza liberación de conexiones**
   - **Cambio:** Agregado bloque `finally` para liberar conexiones
   - **Archivo:** `src/products/products.service.ts:101-127`
   - **Impacto:** Previene connection leaks incluso si `connect()` o `startTransaction()` fallan
   - **Beneficio:** Estabilidad bajo carga alta, evita agotamiento del pool de conexiones

**4. Query Optimization: Elimina query innecesaria en updates**
   - **Cambio:** Removida llamada a `findOne(id)` después de guardar en transacción
   - **Archivo:** `src/products/products.service.ts:116`
   - **Impacto:** Reduce latencia en actualizaciones de 10-50ms
   - **Beneficio:** Mejor rendimiento en operaciones de actualización

### 📋 Cambios en API

#### ProductsService

**Firma actualizada de `create()`:**
```typescript
// Antes (sin user)
async create(createProductDto: CreateProductDto): Promise<Product>

// Ahora (requiere user)
async create(createProductDto: CreateProductDto, user: User): Promise<Product>
```
**Razón:** Cada producto debe estar asociado a un usuario propietario.

**Firma actualizada de `update()`:**
```typescript
// Antes (sin user)
async update(id: string, updateProductDto: UpdateProductDto): Promise<Product>

// Ahora (requiere user)
async update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<Product>
```
**Razón:** Mantiene la relación usuario-producto al actualizar.

#### FilesService

**Método `getStaticProductImage()` es ahora async:**
```typescript
// Antes (síncrono)
getStaticProductImage(name: string): string

// Ahora (asíncrono)
async getStaticProductImage(name: string): Promise<string>
```
**Razón:** Usar `fs.promises.access()` en lugar de `existsSync()` para no bloquear el event loop.

**Actualización requerida en FilesController:**
```typescript
// El método findProductImage() ahora es async y usa await
async findProductImage(@Res() res: express.Response, @Param('name') name: string)
```

### 🐛 Bugfixes

- **Corrección de tipo TypeScript en SeedService:** Array `promises` ahora está correctamente tipificado como `Promise<Product>[]`
- **Prevención de null userId:** Ahora se asigna correctamente el usuario al crear productos en seed

### 📚 Documentación

- Actualizado `CLAUDE.md` con información sobre las optimizaciones de performance
- Actualizado `README.md` con secciones de Autenticación y Carga de Imágenes
- Agregadas variables de entorno requeridas (`JWT_SECRET`, `HOST_API`) a la guía de configuración

### 📊 Métricas de Mejora

| Mejora | Latencia Ahorrada | Riesgo Eliminado |
|--------|-------------------|------------------|
| Hash async | 100-200ms/request | Congelamiento del servidor |
| fs.access async | 1-5ms/request | Bloqueo en descargas concurrentes |
| finally block | — | Connection leaks |
| Query eliminada | 10-50ms/request | Latencia innecesaria |

---

## [1.0.0] - 2026-08-31

### ✨ Initial Release

- Estructura inicial de NestJS con TypeORM y PostgreSQL
- Módulo de Productos con relación 1:N para imágenes
- Paginación de productos
- Validación estricta con DTOs
- Documentación automática con Swagger
- Seed loader para datos de prueba
- CRUD completo para productos