const request = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../src/app');
const db = require('../src/database');

describe('Task CRUD', () => {
    let token;
    let userId;
    let taskId;
    let otherUserId;
    let otherToken;
    let otherTaskId;

    const testUser = {
        name: 'Task Test User',
        email: 'task@example.com',
        password: '123456',
    };

    beforeAll(async () => {
        const otherUser = {
            name: 'Other Task User',
            email: 'other-task@example.com',
            password: '123456',
        };

        // Remove usuários de teste caso já existam
        await db.query(
            'DELETE FROM users WHERE email IN ($1, $2)',
            [testUser.email, otherUser.email]
        );

        // Cria primeiro usuário
        const passwordHash = await bcrypt.hash(
            testUser.password,
            10
        );

        const userResult = await db.query(
            `INSERT INTO users
         (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
            [
                testUser.name,
                testUser.email,
                passwordHash,
            ]
        );

        userId = userResult.rows[0].id;

        // Cria segundo usuário
        const otherPasswordHash = await bcrypt.hash(
            otherUser.password,
            10
        );

        const otherUserResult = await db.query(
            `INSERT INTO users
         (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
            [
                otherUser.name,
                otherUser.email,
                otherPasswordHash,
            ]
        );

        otherUserId = otherUserResult.rows[0].id;

        // Login do primeiro usuário
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(loginResponse.statusCode).toBe(200);

        token = loginResponse.body.token;

        // Login do segundo usuário
        const otherLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: otherUser.email,
                password: otherUser.password,
            });

        expect(otherLoginResponse.statusCode).toBe(200);

        otherToken = otherLoginResponse.body.token;
    });

    afterAll(async () => {
        // Remove tarefas dos usuários de teste
        await db.query(
            'DELETE FROM tasks WHERE user_id IN ($1, $2)',
            [userId, otherUserId]
        );

        // Remove usuários de teste
        await db.query(
            'DELETE FROM users WHERE id IN ($1, $2)',
            [userId, otherUserId]
        );
    });

    it('should reject creating a task without authentication', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Unauthenticated task',
            });

        expect(response.statusCode).toBe(401);
    });

    it('should create a task', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Learn Jest',
                description: 'Write tests for Tasker',
                priority: 'high',
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Learn Jest');
        expect(response.body.description).toBe(
            'Write tests for Tasker'
        );
        expect(response.body.priority).toBe('high');
        expect(response.body.status).toBe('pending');
        expect(response.body.user_id).toBe(userId);

        taskId = response.body.id;
    });

    it('should reject task without title', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Task without title',
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'Title is required',
        });
    });

    it('should reject invalid priority', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Invalid priority',
                priority: 'urgent',
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'Invalid priority',
        });
    });

    it('should list user tasks', async () => {
        const response = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);

        expect(
            response.body.some(task => task.id === taskId)
        ).toBe(true);
    });

    it('should get a task by id', async () => {
        const response = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.id).toBe(taskId);
        expect(response.body.title).toBe('Learn Jest');
    });

    it('should create a task for the second user', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${otherToken}`)
            .send({
                title: 'Other User Task',
                description: 'This task belongs to another user',
                priority: 'low',
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.title).toBe(
            'Other User Task'
        );

        expect(response.body.user_id).toBe(
            otherUserId
        );

        otherTaskId = response.body.id;
    });

    it('should not allow user to access another user task', async () => {
        const response = await request(app)
            .get(`/api/tasks/${otherTaskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: 'Task not found',
        });
    });

    it('should not allow user to update another user task', async () => {
        const response = await request(app)
            .put(`/api/tasks/${otherTaskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Hacked task',
            });

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: 'Task not found',
        });
    });

    it('should not allow user to change another user task status', async () => {
        const response = await request(app)
            .patch(`/api/tasks/${otherTaskId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'completed',
            });

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: 'Task not found',
        });
    });

    it('should not allow user to delete another user task', async () => {
        const response = await request(app)
            .delete(`/api/tasks/${otherTaskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            error: 'Task not found',
        });
    });

    it('should update a task', async () => {
        const response = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Learn Jest and Supertest',
                priority: 'medium',
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.title).toBe(
            'Learn Jest and Supertest'
        );

        expect(response.body.priority).toBe('medium');
    });

    it('should update task status', async () => {
        const response = await request(app)
            .patch(`/api/tasks/${taskId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'completed',
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.status).toBe(
            'completed'
        );
    });

    it('should reject invalid task status', async () => {
        const response = await request(app)
            .patch(`/api/tasks/${taskId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'finished',
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'Invalid status',
        });
    });

    it('should reject update without fields', async () => {
        const response = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            error: 'At least one field is required',
        });
    });

    it('should delete a task', async () => {
        const response = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(204);

        // Garante que realmente foi removida
        const getResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.statusCode).toBe(404);
    });
});