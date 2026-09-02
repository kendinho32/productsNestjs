# Guía de Migración v1.0 → v1.1

Este documento detalla los cambios breaking y cómo adaptar tu código.

---

## 🔴 Breaking Changes

### 1. ProductsService.create() - Parámetro user requerido

**Antes:**
```typescript
const product = await this.productsService.create(createProductDto);
```

**Ahora:**
```typescript
const product = await this.productsService.create(createProductDto, user);
```

**Impacto:** Si llamas a `create()` sin el parámetro `user`, obtendrás un error de compilación TypeScript.

**Solución:** Obtén el usuario autenticado del request y pásalo al método:
```typescript
@Post()
@Auth()
create(
  @Body() createProductDto: CreateProductDto,
  @GetUserDecorator() user: User,  // ← Obtén el usuario
) {
  return this.productsService.create(createProductDto, user);
}
```

---

### 2. ProductsService.update() - Parámetro user requerido

**Antes:**
```typescript
const product = await this.productsService.update(id, updateProductDto);
```

**Ahora:**
```typescript
const product = await this.productsService.update(id, updateProductDto, user);
```

**Impacto:** Llamadas a `update()` sin el parámetro `user` fallarán.

**Solución:** Similar a create(), pasa el usuario autenticado:
```typescript
@Patch(':id')
@Auth()
update(
  @Param('id') id: string,
  @Body() updateProductDto: UpdateProductDto,
  @GetUserDecorator() user: User,  // ← Obtén el usuario
) {
  return this.productsService.update(id, updateProductDto, user);
}
```

---

### 3. FilesService.getStaticProductImage() - Ahora es async

**Antes (síncrono):**
```typescript
const path = this.filesService.getStaticProductImage(name);
res.sendFile(path);
```

**Ahora (async):**
```typescript
const path = await this.filesService.getStaticProductImage(name);
res.sendFile(path);
```

**Impacto:** El controlador de archivos debe ser async y usar await.

**Solución:** Actualiza el método del controlador:
```typescript
@Get('product/:name')
async findProductImage(
  @Res() res: express.Response,
  @Param('name') name: string,
) {
  const path = await this.filesService.getStaticProductImage(name);
  res.sendFile(path);
}
```

---

## ⚠️ Cambios en la Base de Datos

### Relación ManyToOne Usuario-Producto

La tabla `products` ahora tiene una columna **NOT NULL** `userId` que referencia a `users`.

**Impacto:** 
- No puedes crear productos sin asociarlos a un usuario
- El endpoint `POST /api/products` ahora requiere autenticación
- Los datos existentes de productos sin usuarios serán inválidos

**Migración de datos existentes:**
```sql
-- Si tienes productos existentes sin usuario asignado:
-- 1. Crea un usuario admin si no existe
-- 2. Asigna todos los productos a ese usuario

UPDATE products 
SET user_id = '<uuid_del_usuario_admin>'
WHERE user_id IS NULL;
```

---

## ✅ Checklist de Migración

- [ ] Actualizar llamadas a `ProductsService.create()` para pasar `user`
- [ ] Actualizar llamadas a `ProductsService.update()` para pasar `user`
- [ ] Actualizar controlador de archivos: hacer método async y agregar await
- [ ] Probar endpoint de crear productos con autenticación
- [ ] Probar endpoint de actualizar productos con autenticación
- [ ] Probar descarga de imágenes
- [ ] Ejecutar tests: `yarn test`
- [ ] Ejecutar seed: `curl http://localhost:3000/api/seed`

---

## 🔧 Pruebas de Integración

### Crear un producto (ahora requiere autenticación)

```bash
# 1. Registrarse
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "Test User"
  }' | jq -r '.token' > token.txt

# 2. Obtener el token
TOKEN=$(cat token.txt)

# 3. Crear producto con el token
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "price": 29.99,
    "sizes": ["S", "M"],
    "gender": "unisex"
  }'
```

### Subir imagen de producto

```bash
# La imagen se sube por separado
curl -X POST http://localhost:3000/api/files/product \
  -F "file=@image.jpg" | jq '.secureUrl'
```

---

## 📞 Soporte

Si tienes problemas durante la migración:
1. Consulta los nuevos ejemplos en `README.md`
2. Revisa los cambios en `CLAUDE.md` (sección de Performance)
3. Verifica el `CHANGELOG.md` para detalles técnicos
4. Ejecuta `yarn test` para validar tu código

---

## 🎉 Beneficios de Actualizar

Una vez migrado, tu aplicación tendrá:
- ✅ Mejor performance bajo carga concurrente
- ✅ No más bloqueos del event loop
- ✅ Seguridad mejorada: productos asociados a usuarios
- ✅ Mejor manejo de conexiones DB
- ✅ Autenticación JWT completa
