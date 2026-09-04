const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('should return the API message', async () => {
    const response = await request(app)
      .get('/');

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: 'Tasker API',
    });
  });
});