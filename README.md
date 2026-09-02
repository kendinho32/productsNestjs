# Teslo Shop API

Esta es una API REST profesional desarrollada con **NestJS** y **TypeORM** utilizando una base de datos **PostgreSQL**. Cuenta con funcionalidades para la gestión de productos, relaciones de uno a muchos para imágenes, paginación de resultados, un cargador de semilla de base de datos (Seed), validaciones estrictas de datos de entrada y documentación interactiva automática en línea mediante **Swagger**.

---

## 🛠️ Requisitos Previos

Antes de iniciar el proyecto, asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- [Yarn](https://yarnpkg.com/) (Gestor de paquetes recomendado)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Para la base de datos PostgreSQL)

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para levantar el entorno de desarrollo localmente:

### 1. Clonar el repositorio
Si estás clonando el repositorio por primera vez:
```bash
git clone https://github.com/kendinho32/productsNestjs.git
cd productsNestjs
```

### 2. Instalar las dependencias
Instala los paquetes necesarios definidos en el archivo `package.json`:
```bash
yarn install
```

### 3. Configurar las variables de entorno
Crea una copia del archivo de plantilla `.env.template` y renómbralo a `.env`:
```bash
cp .env.template .env
```
Abre el archivo `.env` recién creado y ajusta los valores si es necesario:
```env
DB_PASSWORD=root123
DB_NAME=testDB
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
PORT=3000
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui
HOST_API=http://localhost:3000
```

**Nota:** Las variables `JWT_SECRET` y `HOST_API` son requeridas para la autenticación y para construir las URLs de las imágenes cargadas.

### 4. Levantar la base de datos en Docker
El proyecto contiene un archivo `docker-compose.yaml` preconfigurado. Ejecuta el siguiente comando para descargar la imagen de PostgreSQL e iniciar el contenedor de base de datos en segundo plano:
```bash
docker-compose up -d
```

### 5. Poblar la base de datos (Ejecutar Seed)
Para cargar productos y datos iniciales de prueba en la base de datos, inicia el servidor de desarrollo y ejecuta el endpoint de Seed (puedes hacerlo desde el navegador o mediante Postman/curl):
- Levantar el servidor: `yarn start:dev`
- Endpoint de Semilla: Realiza una petición `GET` a `http://localhost:3000/api/seed`

### 6. Ejecutar la aplicación en modo desarrollo
Una vez lista la base de datos y configuradas las variables de entorno:
```bash
yarn start:dev
```
La aplicación estará corriendo en `http://localhost:3000/api`.

---

## 🔗 Base de Datos & Docker

La base de datos PostgreSQL corre en un contenedor Docker aislado llamado `testPostgres` en el puerto `5432`.
Los datos persisten localmente en el directorio `./postgres` del proyecto para evitar la pérdida de información cuando el contenedor se detiene.

Comandos útiles de Docker:
- Detener los servicios: `docker-compose down`
- Ver estado de los contenedores: `docker-compose ps`
- Ver logs de la base de datos: `docker-compose logs db`

---

## 🔐 Autenticación (JWT)

Esta API utiliza **JSON Web Tokens (JWT)** para proteger los endpoints que requieren autenticación.

### Flujo de Autenticación:

1. **Registrar un usuario:** `POST /api/auth/register`
   ```json
   {
     "email": "usuario@example.com",
     "password": "contraseña_segura_123",
     "full_name": "Nombre Completo"
   }
   ```
   Retorna un token JWT en la respuesta.

2. **Login:** `POST /api/auth/login`
   ```json
   {
     "email": "usuario@example.com",
     "password": "contraseña_segura_123"
   }
   ```
   Retorna un token JWT válido por varias horas.

3. **Usar el token:** Incluye el token en el header `Authorization`:
   ```
   Authorization: Bearer <token_jwt_aqui>
   ```

### Endpoints Protegidos:
- `POST /api/products` - Crear productos (requiere autenticación)
- `PATCH /api/products/:id` - Actualizar productos (requiere autenticación)
- `DELETE /api/products/:id` - Eliminar productos (requiere autenticación)

---

## 📸 Carga de Imágenes

La API permite cargar imágenes de productos en formato JPG, PNG o GIF (máximo 10 MB).

### Endpoint de Carga:
**POST** `/api/files/product`
- **Multipart Form Data:** Campo `file` con la imagen
- **Respuesta:** Retorna la URL segura de la imagen para usar en productos

### Ejemplo:
```bash
curl -X POST http://localhost:3000/api/files/product \
  -F "file=@/ruta/a/imagen.jpg"
```

Respuesta:
```json
{
  "secureUrl": "http://localhost:3000/static/products/uuid-v7-filename.jpg",
  "mimetype": "image/jpeg",
  "size": 102400
}
```

### Recuperar Imágenes:
**GET** `/api/files/product/:name`
- Descarga la imagen del servidor

---

## 📝 Documentación Online Interactiva (Swagger)

Esta API cuenta con documentación automatizada detallada mediante **Swagger UI**. En ella se pueden inspeccionar las rutas, los códigos de respuesta, las especificaciones de seguridad y probar los endpoints interactivamente desde el navegador.

- **Ruta de acceso:** `[Swagger](http://localhost:3000/api/doc)` (o la ruta `/api` en el puerto que hayas configurado en el archivo `.env`).

---

## 🚦 Endpoints de la API

A continuación se detallan las rutas disponibles y sus respectivos comportamientos. Todos los endpoints usan el prefijo global `/api`.

### 1. Módulo de Autenticación (Auth)

#### `POST /api/auth/register`
- **Descripción:** Registra un nuevo usuario en el sistema.
- **DTO de Entrada:** Credenciales del usuario (email, password, full_name).
- **Respuestas:**
  - `201 Created`: Usuario registrado exitosamente. Retorna token JWT y datos del usuario.
  - `400 Bad Request`: Email ya existe o datos de entrada inválidos.

#### `POST /api/auth/login`
- **Descripción:** Inicia sesión con un usuario registrado.
- **DTO de Entrada:** Email y contraseña.
- **Respuestas:**
  - `200 OK`: Login exitoso. Retorna token JWT y datos del usuario.
  - `401 Unauthorized`: Credenciales inválidas.

---

### 2. Módulo de Archivos (Files)

#### `POST /api/files/product`
- **Descripción:** Carga una imagen de producto al servidor.
- **Entrada:** Multipart Form Data con campo `file` (JPG, PNG o GIF, máximo 10 MB).
- **Respuestas:**
  - `201 Created`: Imagen cargada exitosamente. Retorna URL segura para usar en productos.
  - `400 Bad Request`: Archivo inválido o tamaño excedido.

#### `GET /api/files/product/:name`
- **Descripción:** Descarga una imagen de producto almacenada en el servidor.
- **Respuestas:**
  - `200 OK`: Archivo descargado exitosamente.
  - `404 Not Found`: Archivo no encontrado.

---

### 3. Módulo de Semilla (Seed)

#### `GET /api/seed`
- **Descripción:** Limpia por completo la base de datos de productos, usuarios e imágenes e inserta un lote de datos de prueba preestablecido (requiere un usuario admin).
- **Respuestas:**
  - `200 OK`: Semilla ejecutada correctamente.
  - `500 Internal Server Error`: Ocurrió un error inesperado al insertar la semilla.

---

### 2. Módulo de Productos (Products)

#### `POST /api/products`
- **Descripción:** Crea un nuevo producto junto con sus imágenes relacionadas.
- **DTO de Entrada:** `CreateProductDto` (cuerpo de la petición).
- **Respuestas:**
  - `201 Created`: Producto creado exitosamente con sus imágenes. Retorna el producto creado.
  - `400 Bad Request`: Error de validación de campos o duplicidad de slugs/títulos únicos.

#### `GET /api/products`
- **Descripción:** Obtiene una lista paginada de todos los productos y sus imágenes asociadas.
- **DTO de Entrada:** `PaginationDto` (parámetros de consulta en la URL).
  - `limit` (opcional, default `10`): Cantidad de productos a retornar.
  - `offset` (opcional, default `0`): Cantidad de productos a omitir.
- **Respuestas:**
  - `200 OK`: Lista de productos cargada exitosamente.

#### `GET /api/products/:term`
- **Descripción:** Busca un producto específico. El parámetro `:term` puede ser el ID UUID v7 del producto, el slug de URL, o el título exacto.
- **Respuestas:**
  - `200 OK`: Producto encontrado.
  - `404 Not Found`: No existe un producto que coincida con el término ingresado.

#### `PATCH /api/products/:id`
- **Descripción:** Actualiza de forma parcial o total la información de un producto por su ID. Las imágenes existentes pueden actualizarse enviando una nueva lista de URLs.
- **Parámetro URL:** `:id` debe ser un UUID válido (v7).
- **DTO de Entrada:** `UpdateProductDto` (cuerpo de la petición, todas las propiedades del `CreateProductDto` son opcionales aquí).
- **Respuestas:**
  - `200 OK`: Producto actualizado exitosamente. Retorna el producto modificado.
  - `400 Bad Request`: Datos de entrada inválidos.
  - `404 Not Found`: No se encontró ningún producto con el ID especificado.

#### `DELETE /api/products/:id`
- **Descripción:** Elimina un producto de la base de datos por su ID UUID v7. Por cascada, elimina también todas sus imágenes asociadas.
- **Parámetro URL:** `:id` debe ser un UUID válido (v7).
- **Respuestas:**
  - `200 OK`: Producto eliminado exitosamente.
  - `404 Not Found`: No se encontró ningún producto con el ID especificado.

#### `DELETE /api/products`
- **Descripción:** Elimina de forma absoluta todos los productos y registros de la base de datos (método de limpieza).
- **Respuestas:**
  - `200 OK`: Todos los productos eliminados exitosamente.

---

## 🗂️ Estructuras de Datos de Entrada (DTOs)

### `CreateProductDto`
Cuerpo JSON enviado para crear un producto.
```json
{
  "title": "Teslo Hoodie",          // (Requerido) string. Mínimo 3 caracteres. Debe ser único.
  "price": 29.99,                   // (Opcional) number. Debe ser positivo. Default: 0.
  "description": "Un abrigo suave", // (Opcional) string.
  "slug": "teslo_hoodie",           // (Opcional) string. Si no se provee, se genera a partir del título. Único.
  "stock": 10,                      // (Opcional) integer. Debe ser positivo. Default: 0.
  "sizes": ["S", "M", "L"],         // (Requerido) array de strings.
  "gender": "unisex",               // (Requerido) string. Opciones permitidas: 'men', 'women', 'kid', 'unisex'.
  "tags": ["hoodie", "clothes"],    // (Opcional) array de strings. Default: [].
  "images": ["url1.png", "url2.png"]// (Opcional) array de strings con URLs de imágenes.
}
```

### `UpdateProductDto`
Hereda todas las propiedades de `CreateProductDto`, pero de forma **opcional**. Permite enviar solo los campos que se desean modificar.

### `PaginationDto`
Parámetros de consulta en URL (`query parameters`) para paginar resultados.
```
GET /api/products?limit=5&offset=10
```
- `limit` (opcional): Número positivo que indica el tamaño de página. Default: 10.
- `offset` (opcional): Número igual o mayor a 0 que indica cuántos elementos saltar. Default: 0.

---

- **Autor:** Kendall Navarro
- **Licencia:** MIT
