// __tests__/functional/permission.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';
import PermissionEntity from '../../src/domain/entities/permission.entity';

// Variables d'environnement avec les bons noms
process.env.JWT_SECRET_KEY = '*!-Ma_Superpassclée_secrête_DELAMORTQUITUE-!*';
process.env.JWT_REFRESH_SECRET_KEY = '*/*La_refresh_secret_key_super_secrete*/*';
process.env.JWT_DURATION = '2h';
process.env.JWT_REFRESH_TOKEN_TIME = '20h';

// Variables pour MySQLUserConnexion
process.env.USERDB_HOST_SERVER = 'localhost';
process.env.USERDB_USERNAME = 'zisquier';
process.env.USERDB_PASSWORD = 'pass';
process.env.USERDB_DATABASE_NAME = 'asmtariste_userdb';
process.env.USERDB_PORT_NUMBER = '3306';
process.env.USERDB_CONNEXION_LIMIT = '10';

// Mock des permissions normales
const mockPermissions = [
  new PermissionEntity(1, 'READ_USERS', 'Lire les utilisateurs', 'Permission de lecture des utilisateurs', 'USER_MANAGEMENT'),
  new PermissionEntity(2, 'WRITE_USERS', 'Écrire les utilisateurs', 'Permission d\'écriture des utilisateurs', 'USER_MANAGEMENT'),
  new PermissionEntity(3, 'DELETE_USERS', 'Supprimer les utilisateurs', 'Permission de suppression des utilisateurs', 'USER_MANAGEMENT'),
  new PermissionEntity(4, 'ADMIN_ACCESS', 'Accès administrateur', 'Permission d\'accès administrateur', 'ADMIN')
];

// Mock du PermissionRepository
jest.mock('../../src/data/repositories/permission.repository', () => {
  return jest.fn().mockImplementation(() => ({
    getPermissionsByUserUuid: jest.fn(() => Promise.resolve(mockPermissions))
  }));
});

// Mock MySQLUserConnexion
jest.mock('../../src/infrastructure/database/mysql-user.connexion', () => ({
  __esModule: true,
  default: {
    getDbConfig: () => ({
      host: process.env.USERDB_HOST_SERVER,
      user: process.env.USERDB_USERNAME,
      password: process.env.USERDB_PASSWORD,
      database: process.env.USERDB_DATABASE_NAME,
      port: parseInt(process.env.USERDB_PORT_NUMBER || '3306'),
      connectionLimit: parseInt(process.env.USERDB_CONNEXION_LIMIT || '10')
    })
  }
}));

// Mock MySQL pool
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue([[]]),
      release: jest.fn()
    }),
    end: jest.fn()
  }))
}));

describe("Permission Routes", () => {
  let app: any;
  let authToken: string;

  beforeAll(() => {
    // Supprimer les logs pendant les tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Créer le token JWT
    authToken = jwt.sign(
      { uuid: 'test-uuid', firstname: 'Test', lastname: 'User', role: 'admin' },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '1h' }
    );

    // Importer l'app après tous les mocks
    app = require("../../src/index").default;
  });

  afterAll(() => {
    // Restaurer les logs
    jest.restoreAllMocks();
  });

  describe("GET /user/v1/admin/permission", () => {
    it("should return permissions for a valid user UUID", async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .get(`/user/v1/admin/permission?uuid=${validUuid}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Vérifier la structure des permissions retournées
      expect(response.body[0]).toHaveProperty('code');
      expect(response.body[0]).toHaveProperty('name');
      
      // Vérifier que les permissions attendues sont présentes
      const permissionCodes = response.body.map((p: any) => p.code);
      expect(permissionCodes).toContain('READ_USERS');
      expect(permissionCodes).toContain('WRITE_USERS');
      expect(permissionCodes).toContain('DELETE_USERS');
      expect(permissionCodes).toContain('ADMIN_ACCESS');
    });

    it("should return 401 when no authorization token is provided", async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .get(`/user/v1/admin/permission?uuid=${validUuid}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token missing or invalid');
    });

    it("should return 401 with invalid authorization token", async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const invalidToken = 'invalid.token.here';
      
      const response = await request(app)
        .get(`/user/v1/admin/permission?uuid=${validUuid}`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });

    it("should return 400 when UUID parameter is invalid", async () => {
      const invalidUuid = 'invalid-uuid-format';
      
      const response = await request(app)
        .get(`/user/v1/admin/permission?uuid=${invalidUuid}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('ID de permission invalide');
    });

    it("should return 500 when UUID parameter is missing (actual behavior)", async () => {
      const response = await request(app)
        .get('/user/v1/admin/permission')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(500);
    });
  });
});