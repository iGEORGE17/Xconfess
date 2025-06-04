# XConfess Backend API Documentation

## Authentication Endpoints

### Reset Password

Reset a user's password using a valid reset token.

**URL**: `/auth/reset-password`

**Method**: `POST`

**Auth required**: No

**Data constraints**:

```json
{
    "token": "[valid reset token string]",
    "newPassword": "[password string, minimum 8 characters]"
}
```

**Data example**:

```json
{
    "token": "abc123def456ghi789",
    "newPassword": "newSecurePassword123"
}
```

#### Success Response

**Code**: `200 OK`

**Content example**:

```json
{
    "message": "Password has been reset successfully"
}
```

#### Error Responses

**Condition**: If token is invalid or expired

**Code**: `400 BAD REQUEST`

**Content**:

```json
{
    "statusCode": 400,
    "message": "Invalid or expired reset token",
    "error": "Bad Request"
}
```

**Condition**: If token has expired

**Code**: `400 BAD REQUEST`

**Content**:

```json
{
    "statusCode": 400,
    "message": "Reset token has expired", 
    "error": "Bad Request"
}
```

**Condition**: If validation fails (e.g., password too short)

**Code**: `400 BAD REQUEST`

**Content**:

```json
{
    "statusCode": 400,
    "message": [
        "New password must be at least 8 characters long"
    ],
    "error": "Bad Request"
}
```

## How Password Reset Works

1. **Token Generation**: A password reset token is generated (typically via a "forgot password" endpoint) and stored in the user's record with an expiration time (1 hour).

2. **Token Validation**: When this endpoint is called, it:
   - Finds the user by the provided token
   - Checks if the token hasn't expired
   - Validates the new password meets requirements

3. **Password Update**: If validation passes:
   - The password is hashed and updated
   - The reset token and expiration are cleared from the database
   - A success message is returned

4. **Security Features**:
   - Tokens expire after 1 hour
   - Tokens are single-use (cleared after successful reset)
   - Passwords are securely hashed using bcrypt
   - Input validation prevents weak passwords 