import request from 'supertest';
import jwt from 'jsonwebtoken';

// Environment variables
process.env.JWT_SECRET_KEY = '*!-Ma_Superpassclée_secrête_DELAMORTQUITUE-!*';
process.env.JWT_REFRESH_SECRET_KEY = '*/*La_refresh_secret_key_super_secrete*/*';
process.env.JWT_DURATION = '2h';
process.env.JWT_REFRESH_TOKEN_TIME = '20h';

// UserService Mock to avoid repository
jest.mock('../../src/data/services/user.service', () => {
  return jest.fn().mockImplementation(() => ({
    getAllUsers: jest.fn().mockResolvedValue([
      {
        uuid: 'test-uuid-1',
        nickname: 'testuser1',
        email: 'test1@example.com',
        firstname: 'Test',
        lastname: 'User1',
        avatar: 'avatar1.jpg',
        registration_date: '2025-01-01T00:00:00.000Z',
        last_login: '2025-01-15T00:00:00.000Z',
        is_activated: true
      }
    ]),
    getAllUsersWithRole: jest.fn().mockResolvedValue([]),
    createSession: jest.fn().mockResolvedValue({}),
    refreshSession: jest.fn().mockResolvedValue({}),
    storeSession: jest.fn().mockResolvedValue('OK'),
    verifySession: jest.fn().mockResolvedValue(true),
    deleteSession: jest.fn().mockResolvedValue(true)
  }));
});

// Connection mock
jest.mock('../../src/infrastructure/database/mysql-user.connexion', () => ({
  __esModule: true,
  default: {
    getDbConfig: () => ({
      host: 'localhost',
      user: 'zisquier',
      password: 'pass',
      database: 'asmtariste_userdb',
      port: 3306,
      connectionLimit: 10
    })
  }
}));

describe("User Routes", () => {
  let app: any;
  let authToken: string;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    authToken = jwt.sign(
      { uuid: 'test-uuid', firstname: 'Test', lastname: 'User', role: 'admin' },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '1h' }
    );

    app = require("../../src/index").default;
  });

  it("GET /user/v1/admin/users - should return all users", async () => {
    const response = await request(app)
      .get("/user/v1/admin/users?option=all")
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});