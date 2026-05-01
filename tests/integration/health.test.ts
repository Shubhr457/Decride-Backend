import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../src/app';

describe('Health module', () => {
  it('returns service health status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Backend service is healthy');
    expect(response.body.data.service).toBe('decride-backend');
    expect(response.body.data.status).toBe('ok');
  });

  it('returns database health status', async () => {
    const response = await request(app).get('/api/v1/health/db');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('mongodb');
    expect(response.body.data.status).toBe('connected');
  });

  it('returns a standard 404 response for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown');

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Route GET /api/v1/unknown not found');
  });
});
