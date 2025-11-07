# Secure Authentication System

A backend authentication project built with Node.js, Express, and MongoDB, implementing secure user registration, login, and JSON Web Token (JWT)-based authentication.  
This project follows modern security practices, including password hashing with bcrypt and environment variable configuration.

## Overview

This project demonstrates how to build a production-grade authentication backend from scratch. It supports:

- User registration and login  
- Password encryption using bcrypt  
- Token-based session management using JWT  
- Protected routes using middleware  
- Environment-based configuration

## Tech Stack

| Component | Technology |
|------------|-------------|
| Backend Framework | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Security | bcryptjs, dotenv, helmet, cors |
| Testing | Postman / Thunder Client |

## Security Highlights

- Passwords are hashed and salted using bcrypt before storage.  
- JWTs are signed and verified with a secret key stored in environment variables.  
- Middleware ensures only authenticated users can access protected endpoints.  
- Helmet and CORS are implemented for additional security hardening.

## Future Enhancements

- Refresh token mechanism  
- Role-based access control (admin/user)  
- Two-factor authentication (2FA)  
- Account lockout on repeated failed logins

## Author

**Adharsh Baswaraj**  
Engineering Student | Aspiring Software Developer  
[https://github.com/adharsh0713](#) • [https://www.linkedin.com/in/adharsh-baswaraj-3493a9283/](#)

## License

This project is licensed under the MIT License.
