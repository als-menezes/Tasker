const request = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../src/app');
const db = require('../src/database');

describe('User registration', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
    };

    beforeEach(async () => {
        await db.query(
            'DELETE FROM users WHERE email = $1',
            [testUser.email]
        );
    });

    afterAll(async () => {
        await db.query(
            'DELETE FROM users WHERE email = $1',
            [testUser.email]
        );
    });

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/api/users')
            .send(testUser);

        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(testUser.name);
        expect(response.body.email).toBe(testUser.email);

        expect(response.body).not.toHaveProperty(
            'password_hash'
        );
    });

    it('should not allow duplicate email', async () => {
        // Primeiro cadastro
        const firstResponse = await request(app)
            .post('/api/users')
            .send(testUser);

        expect(firstResponse.statusCode).toBe(201);

        // Segundo cadastro com o mesmo email
        const response = await request(app)
            .post('/api/users')
            .send(testUser);

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            error: 'Email already registered',
        });
    });

    it('should reject incomplete registration data', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                name: 'Test User',
                email: 'incomplete@example.com',
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'Name, email and password are required',
        });
    });

    it('should reject password shorter than 6 characters', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                name: 'Test User',
                email: 'short@example.com',
                password: '12345',
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'Password must have at least 6 characters',
        });
    });
});


describe('User login', () => {
    const testUser = {
        name: 'Login Test',
        email: 'login@example.com',
        password: '123456',
    };

    beforeAll(async () => {
        await db.query(
            'DELETE FROM users WHERE email = $1',
            [testUser.email]
        );

        const passwordHash = await bcrypt.hash(
            testUser.password,
            10
        );

        await db.query(
            `INSERT INTO users
             (name, email, password_hash)
             VALUES ($1, $2, $3)`,
            [
                testUser.name,
                testUser.email,
                passwordHash,
            ]
        );
    });

    afterAll(async () => {
        await db.query(
            'DELETE FROM users WHERE email = $1',
            [testUser.email]
        );
    });

    it('should login with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');

        expect(response.body.user.name).toBe(
            testUser.name
        );

        expect(response.body.user.email).toBe(
            testUser.email
        );
    });

    it('should reject incorrect password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword',
            });

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            error: 'Invalid email or password',
        });
    });

    it('should reject nonexistent user', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'doesnotexist@example.com',
                password: '123456',
            });

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            error: 'Invalid email or password',
        });
    });

    it('should reject incomplete login data', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'Email and password are required',
        });
    });
});


describe('Protected profile route', () => {
    const testUser = {
        name: 'Profile Test',
        email: 'profile@example.com',
        password: '123456',
    };

    beforeAll(async () => {
        await db.query(
            'DELETE FROM users WHERE email = $1',
            [testUser.email]
        );

        const passwordHash = await bcrypt.hash(
            testUser.password,
            10
        );

        await db.query(
            `INSERT INTO users
             (name, email, password_hash)
             VALUES ($1, $2, $3)`,
            [
                testUser.name,
                testUser.email,
                passwordHash,
            ]
        );
    });

    afterAll(async () => {
        await db.query(
            'DELETE FROM users WHERE email = $1',
            [testUser.email]
        );
    });

    it('should reject request without token', async () => {
        const response = await request(app)
            .get('/api/profile');

        expect(response.statusCode).toBe(401);
    });

    it('should reject request with invalid token', async () => {
        const response = await request(app)
            .get('/api/profile')
            .set(
                'Authorization',
                'Bearer invalid-token'
            );

        expect(response.statusCode).toBe(401);
    });

    it('should allow access with a valid token', async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .get('/api/profile')
            .set(
                'Authorization',
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.email).toBe(
            testUser.email
        );

        expect(response.body.name).toBe(
            testUser.name
        );
    });
});