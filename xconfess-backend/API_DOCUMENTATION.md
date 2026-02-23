# XConfess Backend API Documentation

## Authentication Endpoints

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (200)**: 
  ```json
  {
    "access_token": "jwt_token_string"
  }
  ```
- **Error Response (401)**: `Unauthorized`

### Forgot Password
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
  OR
  ```json
  {
    "userId": 123
  }
  ```
- **Data Constraints**: 
  - Either `email` or `userId` must be provided
  - `email` must be a valid email format
  - `userId` must be a positive integer
- **Success Response (200)**: 
  ```json
  {
    "message": "If the user exists, a password reset email has been sent."
  }
  ```
- **Error Response (400)**: 
  ```json
  {
    "message": "Either email or userId must be provided",
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

**Description**: Initiates the password reset process. For security reasons, the endpoint always returns a success message regardless of whether the user exists. If the user is found, an email containing a secure reset token is sent to their registered email address. The token expires after 1 hour.

**Security Features**:
- Tracks IP address and user agent for audit purposes
- Invalidates all previous unused tokens for the user
- Uses cryptographically secure random tokens
- Rate limiting should be implemented at the API gateway level

### Reset Password
- **URL**: `/auth/reset-password`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "token": "reset_token_string",
    "newPassword": "new_secure_password"
  }
  ```
- **Data Constraints**: 
  - `token` is required and must be a valid reset token
  - `newPassword` must meet security requirements (minimum 8 characters)
- **Success Response (200)**: 
  ```json
  {
    "message": "Password has been reset successfully"
  }
  ```
- **Error Response (400)**: 
  ```json
  {
    "message": "Invalid or expired reset token",
    "error": "Bad Request", 
    "statusCode": 400
  }
  ```

**Description**: Completes the password reset process using a valid reset token. The token is validated to ensure it exists, hasn't been used, and hasn't expired. Upon successful reset, the token is marked as used and cannot be reused. The user's old reset password fields are also cleared for security.

**Security Features**:
- Tokens are single-use only
- Tokens expire after 1 hour
- Password is securely hashed using bcrypt
- Comprehensive audit logging
- All user's unused tokens are invalidated after successful reset

## User Endpoints

### Create User
- **URL**: `/user`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string"
  }
  ```
- **Success Response (201)**: User object created
- **Error Response (400)**: Validation error

### Get All Users
- **URL**: `/user`
- **Method**: `GET`
- **Success Response (200)**: Array of user objects

### Get User by ID
- **URL**: `/user/:id`
- **Method**: `GET`
- **Success Response (200)**: User object
- **Error Response (404)**: User not found

### Update User
- **URL**: `/user/:id`
- **Method**: `PATCH`
- **Body**: Partial user object
- **Success Response (200)**: Updated user object

### Delete User
- **URL**: `/user/:id`
- **Method**: `DELETE`
- **Success Response (200)**: Deletion confirmation

## Confession Endpoints

### Get Confessions
- **URL**: `/confession`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `gender` (optional): Filter by gender
  - `ageGroup` (optional): Filter by age group
  - `category` (optional): Filter by category
- **Success Response (200)**: Paginated list of confessions

### Create Confession
- **URL**: `/confession`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "title": "string",
    "content": "string",
    "category": "string",
    "gender": "MALE|FEMALE|OTHER",
    "ageGroup": "string"
  }
  ```
- **Success Response (201)**: Created confession object

### Get Confession by ID
- **URL**: `/confession/:id`
- **Method**: `GET`
- **Success Response (200)**: Confession object with reactions
- **Error Response (404)**: Confession not found

## Reaction Endpoints

### Create Reaction
- **URL**: `/reaction`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "confessionId": "number",
    "reactionType": "LIKE|DISLIKE|LOVE|ANGRY|SAD"
  }
  ```
- **Success Response (201)**: Created reaction object

### Get Reactions for Confession
- **URL**: `/reaction/confession/:confessionId`
- **Method**: `GET`
- **Success Response (200)**: Array of reactions for the specified confession

## Password Reset System

The password reset system uses a dedicated `PasswordReset` entity to track reset tokens with the following features:

### Database Schema
- **password_resets** table with fields:
  - `id`: Primary key
  - `token`: Unique reset token (SHA-256 hash)
  - `userId`: Foreign key to users table
  - `expiresAt`: Token expiration timestamp
  - `used`: Boolean flag indicating if token was used
  - `usedAt`: Timestamp when token was used
  - `ipAddress`: IP address of the requester
  - `userAgent`: User agent of the requester
  - `createdAt`: Token creation timestamp

### Email Integration
- Uses a dedicated `EmailService` for sending password reset emails
- Emails contain a secure link with the reset token
- Templates include user-friendly instructions and security warnings
- Configurable frontend URL for the reset link

### Security Measures
- Cryptographically secure token generation using Node.js crypto module
- Tokens are hashed before storage in the database
- Automatic cleanup of expired tokens
- Comprehensive audit logging for all operations
- Rate limiting and IP tracking for abuse prevention
- Single-use tokens that are invalidated after use

## Environment Variables

Required environment variables for the password reset functionality:

```env
# Email Configuration (if using email service)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password

# Frontend URL for password reset links
FRONTEND_URL=https://your-frontend-domain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=xconfess

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=3600s
``` 

## Auth Policy

Scenario,Header,Result
Authenticated,Authorization: Bearer <JWT>,Report is linked to your account (reporterId saved).
Anonymous,(None),Report is accepted as anonymous (reporterId is null).