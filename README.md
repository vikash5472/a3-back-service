## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project Setup

To get started with the project, follow these steps:

1.  **Install Dependencies**:
    ```bash
    $ pnpm install
    ```

## Running the Service

### Development Environment

To run the service in development mode, which includes hot-reloading for convenience:

```bash
# Run in watch mode (with hot-reloading)
$ pnpm run start:dev
```

Alternatively, to run without watch mode:

```bash
# Run in development mode
$ pnpm run start
```

### Production Environment

For production deployment, it's recommended to build the application first and then run the compiled JavaScript.

1.  **Build the Application**:
    ```bash
    $ pnpm run build
    ```
    This command compiles the TypeScript code into JavaScript and places it in the `dist` directory.

2.  **Run the Production Build**:
    ```bash
    $ pnpm run start:prod
    ```
    This command starts the application using the compiled JavaScript from the `dist` directory.

## Environment Variables

The application uses environment variables for configuration. A `.env.example` file is provided as a template.

1.  **Create a `.env` file**:
    Copy the `.env.example` file to `.env` in the root directory of the project:
    ```bash
    $ cp .env.example .env
    ```

2.  **Configure Environment Variables**:
    Edit the newly created `.env` file and set the necessary environment variables, such as database connection strings, API keys, and other sensitive information.

    **Important**: Do not commit your `.env` file to version control, especially if it contains sensitive information. Use environment variables provided by your deployment platform or a dedicated secrets management service in production.

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
