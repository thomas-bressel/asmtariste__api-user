# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0-beta] - 2025-06-17
### Added
 - New middleware to check permission on each routes

## [1.3.0-beta] - 2025-06-12
### Added
- New route to access to the new featur
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