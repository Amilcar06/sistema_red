/**
 * Tests de integración para endpoints de clientes
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import bcrypt from 'bcryptjs';

describe('Clients API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testClientId: string;

  beforeAll(async () => {
    // Crear usuario de prueba y obtener token
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = await prisma.usuario.create({
      data: {
        correo: 'clients-test@example.com',
        contrasena: hashedPassword,
        nombre: 'Clients Test User',
        rol: 'OPERADOR',
      },
    });
    testUserId = testUser.id;

    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        correo: 'clients-test@example.com',
        contrasena: 'password123',
      });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      if (testClientId) {
        await prisma.cliente.deleteMany({
          where: {
            id: testClientId,
          },
        });
      }
      await prisma.cliente.deleteMany({
        where: {
          telefono: {
            in: ['9999999999', '8888888888'],
          },
        },
      });
      if (testUserId) {
        await prisma.usuario.delete({
          where: { id: testUserId },
        });
      }
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/clients', () => {
    it('debería crear un cliente exitosamente', async () => {
      const clientData = {
        nombre: 'Cliente Test',
        telefono: '9999999999',
        correo: 'cliente@test.com',
        plan: 'Plan Test',
        estado: 'ACTIVO',
      };

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe(clientData.nombre);
      expect(response.body.data.telefono).toBe(clientData.telefono);

      testClientId = response.body.data.id;
    });

    it('debería retornar error 400 si el teléfono ya existe', async () => {
      // Crear cliente primero
      await prisma.cliente.create({
        data: {
          nombre: 'Cliente Existente',
          telefono: '8888888888',
          plan: 'Plan Test',
          estado: 'ACTIVO',
        },
      });

      const response = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Otro Cliente',
          telefono: '8888888888', // Mismo teléfono
          plan: 'Plan Test',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('teléfono ya está registrado');
    });

    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/v1/clients')
        .send({
          nombre: 'Cliente Sin Auth',
          telefono: '7777777777',
          plan: 'Plan Test',
        })
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/clients', () => {
    it('debería retornar lista de clientes', async () => {
      const response = await request(app)
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('datos');
      expect(response.body).toHaveProperty('paginacion');
      expect(Array.isArray(response.body.datos)).toBe(true);
    });

    it('debería filtrar por estado', async () => {
      const response = await request(app)
        .get('/api/v1/clients?estado=ACTIVO')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      // Todos los clientes retornados deben estar activos
      if (response.body.datos.length > 0) {
        response.body.datos.forEach((client: any) => {
          expect(client.estado).toBe('ACTIVO');
        });
      }
    });
  });

  describe('GET /api/v1/clients/:id', () => {
    it('debería retornar cliente si existe', async () => {
      if (!testClientId) {
        // Crear cliente si no existe
        const client = await prisma.cliente.create({
          data: {
            nombre: 'Cliente para Get',
            telefono: '1111111111',
            plan: 'Plan Test',
          },
        });
        testClientId = client.id;
      }

      const response = await request(app)
        .get(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(testClientId);
    });

    it('debería retornar error 404 si el cliente no existe', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/clients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/clients/statistics', () => {
    it('debería retornar estadísticas de clientes', async () => {
      const response = await request(app)
        .get('/api/v1/clients/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('activos');
      expect(response.body.data).toHaveProperty('inactivos');
      expect(response.body.data).toHaveProperty('porPlan');
      expect(typeof response.body.data.total).toBe('number');
    });
  });
});

