# NutriVida — Plataforma Web de Atención y Servicios Nutricionales

Proyecto desarrollado para la **Evaluación Parcial 3 (Semanas 12 a 15)** de la asignatura **Desarrollo Fullstack II (DSY1104)**.  
La aplicación permite a los pacientes revisar servicios nutricionales y enviar solicitudes de consulta, mientras que los administradores pueden gestionar el catálogo de servicios y el estado de las consultas desde un panel privado protegido con JWT y roles.

* **Sección:** *(005D)*
* **Integrantes:** *Alexander Ramirez*

---

## Tecnologías y Requisitos Previos

Para levantar este proyecto en un computador local se necesita tener instalado:

* **Java JDK 21** (para compilar y ejecutar el backend).
* **XAMPP** (o cualquier servidor MariaDB / MySQL local corriendo en el puerto `3306`).
* **Node.js 18+** y **npm** (para instalar dependencias y levantar el frontend en React).
* **Git** (opcional, para clonar los repositorios).

### Stack utilizado en el proyecto
* **Backend (`nutrivida-backend`):** Spring Boot, Spring Data JPA (Hibernate), Spring Security, JJWT, SpringDoc OpenAPI (Swagger UI) y MariaDB.
* **Frontend (`nutrivida-frontend`):** React, Vite, React Router DOM y CSS.
* **Testing:** JUnit 5 + MockMvc en backend; Vitest + React Testing Library en frontend.

---

## Estructura de Carpetas

```text
proyecto/
├── nutrivida-backend/                  # Proyecto Backend (Spring Boot)
│   ├── src/main/java/cl/duoc/nutrivida/
│   │   ├── config/                     # OpenApiConfig (Swagger JWT) y carga de datos demo
│   │   ├── controller/                 # Controladores REST (Auth, Servicios, Consultas)
│   │   ├── model/                      # Entidades JPA (Usuario, ServicioNutricional, ConsultaContacto)
│   │   ├── repository/                 # Repositorios JPA
│   │   ├── security/                   # JwtService, JwtAuthenticationFilter y SecurityConfig
│   │   └── service/                    # Lógica de negocio y validaciones
│   ├── src/main/resources/             # application.properties y application-mysql.properties
│   └── src/test/java/cl/duoc/nutrivida/# Pruebas de seguridad (SecurityFlowTest, AuthMeSecurityTest)
│
└── nutrivida-frontend/                 # Proyecto Frontend (React + Vite)
    ├── src/
    │   ├── components/                 # Header, Footer, ServicioCard y RutaProtegida
    │   ├── layouts/                    # Layout principal con navegación y cierre de sesión
    │   ├── pages/                      # Inicio, Servicios, Contacto, Login y Admin
    │   └── services/                   # api.js (fetch + Bearer JWT + manejo sesión) y session.test.js
    └── package.json
```

---

## Guía Paso a Paso para Iniciar el Proyecto

Para que todo funcione correctamente, se debe iniciar primero la base de datos, luego el backend y finalmente el frontend.

### Paso 1: Levantar la Base de Datos (XAMPP / MariaDB)
1. Abrir **XAMPP Control Panel** y presionar **Start** en el módulo **MySQL** (debe quedar corriendo en el puerto `3306`).
2. Abrir **phpMyAdmin** (`http://localhost/phpmyadmin`) y crear una base de datos vacía llamada:
   ```sql
   CREATE DATABASE nutrivida CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. *(Nota)* No es necesario crear las tablas a mano: Spring Boot con Hibernate (`ddl-auto=update`) crea automáticamente las tablas `usuarios`, `servicios_nutricionales` y `consultas_contacto` al arrancar, además de insertar los usuarios y servicios iniciales.
4. La configuración de conexión en `nutrivida-backend/src/main/resources/application-mysql.properties` usa por defecto el usuario `root` sin contraseña (`jdbc:mariadb://localhost:3306/nutrivida`).

---

### Paso 2: Iniciar el Backend (`nutrivida-backend`)
1. Abrir una terminal (PowerShell o CMD) y entrar a la carpeta del backend:
   ```powershell
   cd nutrivida-backend
   ```
2. Ejecutar el servidor activando el perfil `mysql`:
   ```powershell
   .\mvnw.cmd -s .\settings-google.xml "-Dspring-boot.run.profiles=mysql" spring-boot:run
   ```
   *(Si en tu equipo tienes Maven instalado globalmente sin proxy, también funciona `mvn "-Dspring-boot.run.profiles=mysql" spring-boot:run`).*
3. Esperar hasta que en consola aparezca el mensaje `Started NutrividaBackendApplication`.
4. **URLs disponibles del backend:**
   * **API Base:** `http://localhost:8080/api`
   * **Swagger UI (documentación y pruebas):** `http://localhost:8080/swagger-ui.html`

---

### Paso 3: Iniciar el Frontend (`nutrivida-frontend`)
1. Sin cerrar la terminal del backend, abrir una **segunda terminal** y entrar a la carpeta del frontend:
   ```powershell
   cd nutrivida-frontend
   ```
2. Instalar las dependencias del proyecto (solo la primera vez):
   ```powershell
   npm install
   ```
3. Levantar el servidor de desarrollo de Vite:
   ```powershell
   npm run dev
   ```
4. Abrir en el navegador la dirección que muestra Vite:
   * **Web NutriVida:** `http://localhost:5173`

---

## Usuarios de Prueba

Al iniciar el backend por primera vez se crean dos cuentas con contraseñas encriptadas con `BCrypt`:

| Rol | Correo electrónico | Contraseña | Qué puede hacer en el sistema |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@nutrivida.cl` | `admin123` | Acceder a `/admin`, crear/editar/eliminar servicios nutricionales y gestionar consultas de pacientes. |
| **PACIENTE** | `paciente@nutrivida.cl` | `paciente123` | Ver el catálogo de servicios, enviar consultas de atención y mantener su sesión activa. |

---

## Modelo de Datos, Endpoints y Seguridad

### Modelo Relacional y Regla de Negocio
* **Relación `@ManyToOne`:** Cada consulta (`ConsultaContacto`) está vinculada a un servicio (`ServicioNutricional`) mediante la llave foránea `servicio_id`.
* **Validación de consultas duplicadas (`409 Conflict`):** Si un mismo correo intenta registrar una nueva consulta para un servicio en el que ya tiene una solicitud en estado `PENDIENTE`, el backend bloquea el registro y responde `HTTP 409 Conflict`.

### Principales Endpoints REST
| Método | Endpoint | Permiso | Función |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Autentica usuario y devuelve el token JWT, nombre, correo y rol. |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario con rol `PACIENTE`. |
| `GET` | `/api/auth/me` | Autenticado | Valida el JWT actual contra el backend y retorna los datos del usuario conectado. |
| `GET` | `/api/servicios` | Público | Lista los servicios nutricionales disponibles. |
| `POST / PUT / DELETE` | `/api/servicios/**` | Solo `ADMIN` | Crea, actualiza o elimina servicios nutricionales. |
| `POST` | `/api/consultas` | Público | Registra una solicitud de consulta asociada a un servicio. |
| `GET / PATCH / DELETE` | `/api/consultas/**` | Solo `ADMIN` | Lista consultas, cambia su estado (`PENDIENTE` / `ATENDIDA`) o las elimina. |

### Manejo de Sesión y Roles en React
* **Persistencia y recarga (`F5`):** Al iniciar sesión, el token y los datos del usuario se guardan en `localStorage` (`nutrividaAuth`). Al recargar la página (`F5`), `App.jsx` llama automáticamente a `GET /api/auth/me` para verificar en el servidor que el token siga siendo válido.
* **Expiración (`exp`):** `api.js` decodifica el payload del JWT para verificar su fecha de expiración antes de enviarlo; si venció, limpia el almacenamiento y redirige a `/login`.
* **Errores `401` y `403`:** Ante un `401 Unauthorized` se cierra la sesión y se pide volver a ingresar; ante un `403 Forbidden` se muestra un mensaje de falta de permisos sin borrar la sesión actual.
* **Rutas protegidas:** El componente `RutaProtegida.jsx` impide que usuarios sin sesión o con rol `PACIENTE` entren a `/admin`.

---

## Cómo Ejecutar las Pruebas Automatizadas

### 1. Pruebas del Backend (7 tests en JUnit 5 / MockMvc)
```powershell
cd nutrivida-backend
.\mvnw.cmd -s .\settings-google.xml test
```
*Valida el levantamiento del contexto, los códigos `401 / 200 / 403 / 201` por rol (`SecurityFlowTest`) y el endpoint `/api/auth/me` (`AuthMeSecurityTest`).*

### 2. Pruebas y Build del Frontend (41 tests en Vitest)
```powershell
cd nutrivida-frontend
npm test
npm run build
```
*Valida el renderizado de vistas, protección de rutas (`RutaProtegida.test.jsx`), persistencia, logout y expiración de tokens JWT (`session.test.js`), además de generar la compilación de producción en `dist/`.*