# Video Request Service

This is a NestJS-based service for managing video requests. It provides a RESTful API for user authentication, video request management, and more.

## Features

- **User Authentication:** Secure user authentication using email/password and Google OAuth.
- **Video Request Management:** CRUD operations for video requests.
- **API Documentation:** Comprehensive API documentation using Swagger.
- **Scalable Architecture:** Built with a modular and scalable architecture, using services like queues for background jobs.

## API Documentation

This project uses Swagger for API documentation. Once the application is running, you can access the Swagger UI at [http://localhost:3000/api](http://localhost:3000/api).

The Swagger documentation provides detailed information about the available endpoints, including request and response schemas, and allows you to interact with the API directly from your browser.

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd proj-53-service
    ```

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your configuration, such as database connection strings, API keys, and other secrets.

## Running the Application

### Development

To run the application in development mode with hot-reloading:

```bash
# Watch mode
pnpm run start:dev
```

### Production

For production, build the application and then start the server:

```bash
# Build the application
pnpm run build

# Start the production server
pnpm run start:prod
```

## Running Tests

To run the test suite:

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```