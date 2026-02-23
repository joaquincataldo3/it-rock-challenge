# IT Rock Challenge

## Getting started

1. Clone the repository
```bash
git clone https://github.com/joaquincataldo3/it-rock-challenge
cd it-rock-challenge
```

2. Install dependencies
```bash
npm install
```

3. Copy environment variables
```bash
cp .env.example .env
```

4. Start the project
```bash
npm run start
```

This will prompt you to login to Serverless Framework, which will open the browser automatically. Once authenticated, the API will be available at `http://localhost:3000`

## Authentication
All endpoints except `POST /auth/login` require a valid JWT token.
Include it in the request header:
```
Authorization: Bearer <token>
```

## API Documentation
Full API documentation is available in `swagger.yaml`.
You can visualize it at https://editor.swagger.io by copying and pastying the content of swagger.yaml

## Technical Decisions

### Storage
SQLite was chosen for simplicity and persistence between restarts without requiring any external infrastructure. 

### Serverless Framework
Serverless Framework was chosen to simulate the Lambda + API Gateway architecture locally using `serverless-offline`.

### Serverless Architecture
The SQLite connection is initialized outside the handler to take advantage of Lambda's container reuse and minimize cold start impact.

### Authentication
The JWT secret is injected via environment variables through `serverless.yml`, avoiding the need for `dotenv` in the codebase.

### Logging
Structured logging is implemented using `JSON.stringify` without external libraries and simplicity. Logs include `level`, `message`, `timestamp` and relevant context data, making them compatible with CloudWatch filtering.


### Assumptions
-  All code, comments, and documentation are written in English for consistency and professional standards.
- `description` is optional when creating a task
- `title` and `description` are assumed to be strings
- `from` and `to` query filters expect ISO format (YYYY-MM-DD)
- `PATCH /tasks/{id}` accepts partial updates, only the fields provided will be updated
- npm audit vulnerabilities belong to internal dependencies of `serverless-offline` and do not affect application code
