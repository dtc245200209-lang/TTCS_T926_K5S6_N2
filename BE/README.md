# Password Reset API (Java)

Standalone Spring Boot API in Java 17 or later. Routes, controllers, services, persistence entities, and repositories are separated by responsibility.

## Run

From PowerShell, run this from anywhere:

```powershell
& "D:\TTCS_T926_K5S6_N2\BE\run.ps1"
```

Or, from the repository root, run `.\mvnw.cmd -f BE\pom.xml spring-boot:run`. From inside `BE`, run `..\mvnw.cmd -f pom.xml spring-boot:run` (the wrapper is in the parent folder).

The API listens on `http://localhost:3000`. H2 stores accounts and reset tokens under `BE/data/`. By default the `dev` profile creates `testuser@example.com` / `ChangeMe123!` and returns/logs reset tokens to make local development possible. Set `SPRING_PROFILES_ACTIVE=prod` for production settings.

## API

`POST /api/auth/forgot-password`

```json
{ "email": "testuser@example.com" }
```

Responds with a generic message to avoid revealing whether an email is registered. In development, a token is logged and returned in `data.resetToken` so the flow can be tried without an email provider.

`POST /api/auth/reset-password`

```json
{
  "token": "token-from-forgot-password",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

Tokens are generated with `SecureRandom`, stored as SHA-256 hashes, expire after 30 minutes by default, and are deleted after use. Passwords are stored using BCrypt. New passwords must contain at least 8 characters, letters and digits.

`GET /api/auth/health` returns `{ "status": "ok" }`.

## Main files

- `controller/AuthController.java`: HTTP endpoints.
- `dto/`: request and response shapes plus request constraints.
- `service/PasswordResetService.java`: token and password reset workflow.
- `entity/`: H2/JPA entities for accounts and reset tokens.
- `repository/`: Spring Data persistence interfaces.
- `exception/GlobalExceptionHandler.java`: consistent API error responses.
- `config/`: password encoder and development account initializer.

## Configuration

The `prod` profile disables the sample account, H2 console, reset token response, and token logging by default. Configure email delivery before production use. `SEED_ENABLED`, `EXPOSE_RESET_TOKEN`, and `LOG_RESET_TOKEN` override those settings; `RESET_TOKEN_TTL_MINUTES` controls token expiry and `PORT` changes the listening port.

This service has its own H2 database and is separate from the root Java application's H2 database. To reset accounts used by that application, the repositories/entities must be integrated with its existing user schema.
