/**
 * Tests de integración para endpoints de autenticación
 * 
 * Estos tests requieren:
 * 1. Base de datos de prueba configurada
 * 2. Servidor de prueba corriendo
 * 
 * Para ejecutar estos tests:
 * npm run test:integration
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import bcrypt from 'bcryptjs';

describe('Auth API Integration Tests', () => {
  let testUser: {
    correo: string;
    contrasena: string;
    nombre: string;
  };

  beforeAll(async () => {
    // Setup de datos de prueba
    testUser = {
      correo: 'test@example.com',
      contrasena: 'password123',
      nombre: 'Test User',
    };
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      await prisma.usuario.deleteMany({
        where: {
          correo: {
            in: [testUser.correo, 'newuser@example.com', 'existing@example.com', 'me-test@example.com'],
          },
        },
      });
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          correo: 'newuser@example.com',
          contrasena: 'password123',
          nombre: 'New User',
          rol: 'OPERADOR',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.usuario.correo).toBe('newuser@example.com');
      expect(response.body.data.usuario.contrasena).toBeUndefined(); // Contraseña no debe estar en respuesta
    });

    it('debería retornar error 400 si el usuario ya existe', async () => {
      // Primero crear el usuario (usar upsert para evitar error si ya existe)
      await prisma.usuario.upsert({
        where: { correo: 'existing@example.com' },
        update: {},
        create: {
          correo: 'existing@example.com',
          contrasena: await bcrypt.hash('password123', 12),
          nombre: 'Existing User',
          rol: 'OPERADOR',
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          correo: 'existing@example.com',
          contrasena: 'password123',
          nombre: 'Existing User',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('usuario ya existe');
    });

    it('debería retornar error 400 si faltan campos requeridos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          correo: 'incomplete@example.com',
          // Falta contrasena y nombre
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba antes de cada test
      await prisma.usuario.upsert({
        where: { correo: testUser.correo },
        update: {},
        create: {
          correo: testUser.correo,
          contrasena: await bcrypt.hash(testUser.contrasena, 12),
          nombre: testUser.nombre,
          rol: 'OPERADOR',
        },
      });
    });

    it('debería hacer login exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo: testUser.correo,
          contrasena: testUser.contrasena,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.usuario.correo).toBe(testUser.correo);
    });

    it('debería retornar error 401 con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo: testUser.correo,
          contrasena: 'wrong-password',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    it('debería retornar error 401 si el usuario no existe', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo: 'nonexistent@example.com',
          contrasena: 'password123',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
      // Crear usuario y obtener token (usar upsert para evitar errores)
      const user = await prisma.usuario.upsert({
        where: { correo: 'me-test@example.com' },
        update: {},
        create: {
          correo: 'me-test@example.com',
          contrasena: await bcrypt.hash('password123', 12),
          nombre: 'Me Test User',
          rol: 'OPERADOR',
        },
      });

      userId = user.id;

      // Hacer login para obtener token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo: 'me-test@example.com',
          contrasena: 'password123',
        });

      if (loginResponse.status === 200 && loginResponse.body.status === 'success' && loginResponse.body.data?.accessToken) {
        authToken = loginResponse.body.data.accessToken;
      } else {
        throw new Error(`No se pudo obtener token de autenticación. Status: ${loginResponse.status}, Body: ${JSON.stringify(loginResponse.body)}`);
      }
    });

    afterAll(async () => {
      try {
        if (userId) {
          await prisma.usuario.delete({
            where: { id: userId },
          });
        }
      } catch (error) {
        console.error('Error limpiando usuario de prueba:', error);
      }
    });

    it('debería retornar información del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('correo');
      expect(response.body.data.correo).toBe('me-test@example.com');
      expect(response.body.data.contrasena).toBeUndefined(); // Contraseña no debe estar en respuesta
    });

    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('debería retornar error 401 con token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });
});

