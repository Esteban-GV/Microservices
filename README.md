# Auth Service + TODOs Service

Este paquete trae dos proyectos Maven independientes:

- `auth-service/` → tu proyecto actual, con los bugs corregidos.
- `todos-service/` → proyecto nuevo, el que faltaba.

## 1. Por qué te daba 401 en Postman

La causa raíz: tu clase `EgvMicroserive` (la única con `@SpringBootApplication` y `main()`)
vive en el paquete `com.guarinve.egvmicroservice`. Spring Boot escanea componentes a partir
del paquete de esa clase hacia abajo, así que **nunca llegó a ver** `com.guarinve.config`,
`com.guarinve.controller`, `com.guarinve.jwt` ni `com.guarinve.user`.

Consecuencia: tu `SecurityConfig` (la que permite `/auth/**`) jamás se cargó. Spring Boot
detecta `spring-boot-starter-security` en el classpath sin ningún `SecurityFilterChain`
propio y aplica su configuración por defecto: **todo pide autenticación**, con usuario
`user` y una contraseña generada que se imprime en consola. Por eso cualquier request a
`/auth/register` o `/auth/login` te devolvía 401 sin cuerpo.

Encima, `DemoController` también tenía `@SpringBootApplication`, lo cual es inválido: una
clase que es un `@RestController` no debe ser también el punto de arranque de la app.

**La corrección:** moví la clase principal a la raíz del paquete (`com.guarinve.AuthServiceApplication`)
y borré `DemoController`. Con esto, el component scan cubre todo tu código.

## 2. Otros bugs que corregí en `auth-service`

| Archivo | Problema | Corrección |
|---|---|---|
| `jwt/JwtService.java` | Expiración `1000 * 60 * 24` = 24 **minutos**, no 24 horas como decía el comentario | Ahora es `jwt.expiration` configurable (86400000 ms = 24h por defecto) |
| `jwt/JwtService.java` | Secret key hardcodeado en el código fuente | Ahora viene de `jwt.secret` → variable de entorno `JWT_SECRET` |
| `jwt/JwtAuthenticationFilter.java` | Llamaba a `isTokenvalid` (typo) | Renombrado a `isTokenValid` |
| `controller/AuthService.java` | `register()` no valida username duplicado → `DataIntegrityViolationException` sin controlar (500 feo) | Se lanza `UsernameAlreadyExistsException` → responde 409 con mensaje claro |
| `controller/AuthService.java` | `login()` con credenciales inválidas lanzaba `BadCredentialsException` sin capturar → 500 sin mensaje | Ahora la captura `GlobalExceptionHandler` → 401 con mensaje claro |
| — | No existía manejo global de errores → cualquier excepción devolvía 500 en blanco o un stacktrace | `exception/GlobalExceptionHandler.java` (nuevo) |
| — | Requests sin token o con token inválido a una ruta protegida devolvían 403 vacío | `config/JwtAuthenticationEntryPoint.java` (nuevo) responde JSON |
| `config/SecurityConfig.java` | CORS solo vía `@CrossOrigin` en el controller, puede fallar en preflight sobre rutas protegidas | CORS centralizado con `CorsConfigurationSource` |
| `Dockerfile` | `ADD target/egvmicroservice.jar` solo funciona si compilaste antes con Maven **y** tu `pom.xml` tiene `<finalName>egvmicroservice</finalName>` | Dockerfile multi-stage: compila dentro del contenedor con `target/*.jar`, sin depender del nombre del jar |
| `docker-compose.yml` | `depends_on: - db` no espera a que Postgres esté listo para aceptar conexiones | Se agregó `healthcheck` + `condition: service_healthy` |

## 3. Qué faltaba para completar el proyecto: `todos-service`

Es un microservicio Maven **nuevo**, con su propia base de datos Postgres, que:

- No tiene login ni tabla de usuarios.
- Solo valida el JWT que ya emitió `auth-service` (mismo `jwt.secret`), sin llamar a ese
  servicio ni a su base de datos. Así, si `auth-service` se cae, los usuarios que ya
  tienen un token siguen pudiendo usar sus TODOs, tal como lo describiste.
- Expone `GET /todos`, `POST /todos`, `DELETE /todos/{id}` y de bonus `PATCH /todos/{id}/toggle`
  para marcar completado/incompleto (bórralo si no lo quieres).
- Cada TODO queda asociado al `username` que viene dentro del token (claim `sub`), y las
  consultas/borrados siempre filtran por ese usuario — un usuario no puede ver ni borrar
  los TODOs de otro.

No implementé el "Users API" ni el "Redis Queue / Log Message Processor" del diagrama que
enviaste, porque dijiste explícitamente que no estás siguiendo ese diseño al pie de la
letra; tu descripción (dos servicios, dos bases de datos, JWT autocontenido) es justo lo
que armé.

## 4. Instrucciones paso a paso

### 4.1 Aplicar los cambios a tu proyecto actual (`auth-service`)

1. Borra estos dos archivos de tu proyecto real:
   - `src/main/java/com/guarinve/egvmicroservice/EgvMicroserive.java`
   - `src/main/java/com/guarinve/demo/DemoController.java`
   - Borra también las carpetas `egvmicroservice/` y `demo/` si quedan vacías.
2. Copia todo el contenido de `auth-service/src` de este paquete sobre tu
   `src/main/java/com/guarinve/...` actual (reemplaza los archivos existentes).
3. Reemplaza tu `application.properties` con el de `auth-service/src/main/resources/`.
4. Reemplaza tu `Dockerfile` y `docker-compose.yml` con los de `auth-service/`.
5. **No toqué tu `pom.xml`** porque no me lo compartiste. Verifica que tenga:
   - `spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-data-jpa`
   - `spring-boot-starter-validation` (nuevo, lo necesitan las anotaciones `@NotBlank`)
   - `org.postgresql:postgresql`
   - `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (versión 0.11.5, ya que tu código usa `setClaims`/`parserBuilder`, que es la API de esa versión)
   - `org.projectlombok:lombok`

   Si te falta `spring-boot-starter-validation`, agrégala:
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-validation</artifactId>
   </dependency>
   ```

### 4.2 Agregar el proyecto nuevo (`todos-service`)

1. Copia la carpeta `todos-service/` completa a la altura de tu `auth-service/`
   (como un proyecto Maven hermano, no dentro del mismo).
2. No necesitas tocar nada: `pom.xml`, código, `Dockerfile` y `docker-compose.yml`
   ya están completos y listos para levantar.

### 4.3 Levantar todo

Desde `auth-service/`:
```bash
docker compose up --build
```
Desde `todos-service/` (en otra terminal):
```bash
docker compose up --build
```

Quedan así:
- `auth-service` → `http://localhost:8080` (Postgres en `5432`)
- `todos-service` → `http://localhost:8081` (Postgres en `5433`)

⚠️ Antes de levantar, confirma que el valor de `JWT_SECRET` sea **idéntico** en ambos
`docker-compose.yml`. Ya vienen iguales por defecto; si lo cambias, cámbialo en los dos.

### 4.4 Probar con Postman

1. **Registro** — `POST http://localhost:8080/auth/register`
   ```json
   { "username": "juan", "password": "123456" }
   ```
   Respuesta: `{ "token": "eyJhbGciOi..." }`

2. **Login** — `POST http://localhost:8080/auth/login`
   ```json
   { "username": "juan", "password": "123456" }
   ```

3. **Crear un TODO** — `POST http://localhost:8081/todos`
   Header: `Authorization: Bearer <token del paso 1 o 2>`
   ```json
   { "title": "Comprar leche", "description": "2 litros" }
   ```

4. **Listar TODOs** — `GET http://localhost:8081/todos`
   Mismo header `Authorization`.

5. **Probar la resiliencia**: apaga `auth-service` (`docker compose down` en esa carpeta)
   y repite el paso 4 con un token que hayas obtenido antes de apagarlo. Debe seguir
   funcionando — esa es la garantía que buscabas.

6. **Borrar** — `DELETE http://localhost:8081/todos/1` con el mismo header.

## 5. Mejoras opcionales (no implementadas, para cuando quieras seguir)

- Refresh tokens / logout real: un JWT stateless no se puede "invalidar" antes de que
  expire; si necesitas logout inmediato, se resuelve con una blacklist en Redis o tokens
  de vida corta + refresh token.
- Rate limiting en `/auth/login` para mitigar fuerza bruta.
- HTTPS real (en local no hace falta, en producción sí).
- Mover `AuthService`, `LoginRequest`, `RegisterRequest` del paquete `controller` a paquetes
  `service`/`dto` — no es un bug, solo prolijidad.
