# Changelog

All notable changes to this project will be documented in this file.

## [1.7.0-beta] - 2025-06-22
### Added
  - Create a new route to delete user session from cache and from client 


## [1.6.0-beta] - 2025-06-22
### Added
 - Create new database MongoDb to store default interface
 - Create a new service to filter interface item with user permissions
 - Create a new route to get interface item from database 


## [1.5.1-beta] - 2025-06-19
### Patch
 - Fix csrf middleware in refreshToken method

## [1.5.0-beta] - 2025-06-18
### Added
 - New route admin/refresh to send a new JWT to the client 
 - Create a id_session in Redis cache
 - Create a route to verify if the user has an active session

## [1.4.0-beta] - 2025-06-17
### Added
 - New middleware to check permission on each routes

## [1.3.0-beta] - 2025-06-12
### Added
- New route to access to the new auth feature admin/login 
- New service to get all users with role informations
- Create new unit tests for User Controller



## [1.2.0-beta] - 2025-06-10
### Added
- New job test to run tests in CI/CD pipeline
- Unit tests on user controller getAllUser method to check valid server response
- Unit tests on user controller getAllUsers() method to test option query in HTTP Request
- User route to get all users from database
- Controller to get all users
- Service to get all User from repository and convert data into DTO data object
- MySQL config module to connect to database
- Query to get all users
- Aggregated entity interface merging User with Role
- 3 entities based on database table: user, role and permission
- CSRF middleware implementation
- Bodyparser middleware and Frozen decorator implementation

## [1.1.0-beta] - 2025-06-04
### Added
- Cors config module
### Fixed
- Corrections in CI/CD pipeline (multiple fixes)
### Changed
- Setting the Express API with ServerConfig module

## [1.0.0-beta] - 2025-06-03
### Added
- CI/CD yaml file creation
- Initial project setup and first deposit