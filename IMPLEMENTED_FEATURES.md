# Implemented Features

This document outlines the functionalities that have been implemented in the application.

1.  **User Authentication:**
    *   Users can sign up and log in using Google OAuth.
    *   Users can sign up and log in using their phone number via OTP (One-Time Password).
    *   Authenticated users can link a phone number to their profile.
    *   Authenticated users can link an email address to their profile, with email verification via SendGrid.

2.  **Session Management:**
    *   Upon successful authentication, a JWT (JSON Web Token) is generated and sent as a response.
    *   The application stores the active JWT for each user (`appJwtToken` in the user schema) to enable immediate session invalidation.
    *   Real-time user token invalidation is implemented by comparing the presented JWT with the `appJwtToken` stored in the user's schema.
    *   Routes can be protected using JWT for authorization (e.g., `/profile`).

3.  **OTP Service:**
    *   Users can request a maximum of 2 OTPs within a 1-hour window.
    *   After 2 invalid OTP attempts, a user will be blocked from requesting/verifying OTPs for the next 2 hours.
    *   OTP SMS messages are sent using Twilio.
    *   Node-cache is used for OTP rate limiting and blocking.

4.  **API Documentation:**
    *   Swagger documentation is integrated and available for all endpoints.

5.  **Code Quality & Standards:**
    *   Input requests are properly validated using DTOs and `class-validator`.
    *   Proper NestJS HTTP Exceptions are used for error handling.
    *   Best practices and standards have been followed in the implementation.
    *   The application uses Mongoose for MongoDB integration and user persistence.

6.  **Scalability & Optimization:**
    *   The logic is designed to be optimized and scalable within the current architecture.
