# Microservices Project

Un ecosistema minimalista de microservicios dividido en dos módulos principales (`auth-service` y `todos-service`), diseñado para la gestión de usuarios y tareas respaldado por contenedores.

---

## Qué hace?
* **Autenticación (`auth-service`)**: Gestiona el registro, acceso y generación de tokens JWT para los usuarios.
* **Gestión de Tareas (`todos-service`)**: Permite listar, crear, completar y eliminar tareas de forma segura utilizando validación mediante tokens.
* **Frontend Minimalista**: Una interfaz web estática conectada a los microservicios mediante peticiones asíncronas (`fetch`).

---

## Cómo funciona?
El sistema está completamente orquestado con **Docker Compose**. Al iniciar el proyecto desde la raíz, se despliegan automáticamente los contenedores de las aplicaciones junto con sus bases de datos PostgreSQL independientes y aisladas en una red interna.

---

## Qué se utilizó?
* **Java 21 & Spring Boot**: Framework principal para el desarrollo de los microservicios.
* **Spring Security & JWT**: Implementación de seguridad y control de acceso sin estado (stateless).
* **Spring Data JPA / Hibernate**: Persistencia y mapeo de datos con la base de datos.
* **PostgreSQL (Alpine)**: Motor de base de datos relacional para cada servicio.
* **Docker & Docker Compose**: Contenedorización y orquestación de todo el entorno.
* **Tailwind CSS**: Estilos modernos e interfaz visual responsiva en el cliente web.

---

## Cómo iniciar el proyecto

Puedes levantar todo el ecosistema de forma automática ejecutando un único comando desde la carpeta raíz:

```bash
./runAll.sh
