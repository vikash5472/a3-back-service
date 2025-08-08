# Implemented Features

This document outlines the functionalities that have been implemented in the application.

1.  **User Authentication:**
    - Users can sign up and log in using Google OAuth.
    - Users can sign up and log in using their phone number via OTP (One-Time Password).
    - Authenticated users can link a phone number to their profile.
    - Authenticated users can link an email address to their profile, with email verification via SendGrid. The email verification process involves a token-based flow where a temporary email is stored, a verification token is sent, and an endpoint (`/auth/verify-email`) is used to confirm the email.

2.  **Session Management:**
    - Upon successful authentication, a JWT (JSON Web Token) is generated and sent as a response.
    - The application stores the active JWT for each user (`appJwtToken` in the user schema) to enable immediate session invalidation.
    - Real-time user token invalidation is implemented by comparing the presented JWT with the `appJwtToken` stored in the user's schema, leveraging `CacheService` for efficient lookup.
    - Routes are protected using `JwtAuthGuard` for authorization (e.g., `/profile`, `/video-requests`).

3.  **OTP Service:**
    - Users can request a maximum of 2 OTPs within a 1-hour window.
    - After 2 invalid OTP attempts, a user will be blocked from requesting/verifying OTPs for the next 2 hours.
    - OTP SMS messages are sent using a generic SMS service (`SmsService` with Twilio implementation).
    - `Node-cache` is used for OTP rate limiting and blocking.

4.  **API Documentation:**
    - Swagger documentation is integrated and available for all endpoints, providing clear API definitions, operation summaries, request bodies, and response schemas.

5.  **Video Requests:**
    - Users can create, retrieve, update, and delete their video requests.
    - Endpoints are provided for creating a new video request, getting all video requests for the authenticated user, getting a single video request by ID, updating a video request by ID, deleting a video request by ID, and creating a modification of an existing video request.

6.  **User Management:**
    - Basic user creation, retrieval by phone number or email, and updates are handled by the `UserService`.

7.  **Code Quality & Standards:**
    - Input requests are properly validated using DTOs (`Data Transfer Objects`) and `class-validator`.
    - Global `ValidationPipe` is applied to ensure all incoming requests are validated automatically.
    - Proper NestJS HTTP Exceptions are used for consistent error handling.
    - Best practices and standards have been followed in the implementation.
    - The application uses Mongoose for MongoDB integration and user persistence, with defined schemas for `User` and `VideoRequest`.

8.  **Scalability & Optimization:**
    - A `QueueService` is implemented to handle asynchronous tasks (e.g., sending emails and SMS) to improve responsiveness and scalability.
    - `CommonModule` is a global module that provides shared services like `SendgridService`, `SmsService`, `CacheService`, and `QueueService` across the application.
    - The logic is designed to be optimized and scalable within the current architecture.
