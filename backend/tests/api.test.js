const request = require('supertest');
const app = require('../src/app');

describe('Mini Attendance Management System API Integration Tests', () => {
    let adminToken;
    let createdEmployeeId;

    // 1. Authentication Tests
    describe('AUTH API (/api/auth)', () => {
        test('POST /api/auth/login - Should successfully log in admin', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin',
                    password: 'admin123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.role).toEqual('admin');

            adminToken = res.body.data.token;
        });

        test('POST /api/auth/login - Should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });

        test('POST /api/auth/register then /login - Should log in registered email with same password', async () => {
            const email = `auth.${Date.now()}@example.com`;
            const password = 'TestPass123';

            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    fullName: 'Auth Flow Test',
                    email: `  ${email.toUpperCase()}  `,
                    password
                });

            expect(registerRes.statusCode).toEqual(201);
            expect(registerRes.body.success).toBe(true);
            expect(registerRes.body.data.user.username).toEqual(email);

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: ` ${email.toUpperCase()} `,
                    password
                });

            expect(loginRes.statusCode).toEqual(200);
            expect(loginRes.body.success).toBe(true);
            expect(loginRes.body.data).toHaveProperty('token');
            expect(loginRes.body.data.user.username).toEqual(email);
        });
    });

    // 2. Employee API Tests
    describe('EMPLOYEE API (/api/employees)', () => {
        test('GET /api/employees - Should return paginated employee list', async () => {
            const res = await request(app)
                .get('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });

        test('POST /api/employees - Should create a new employee', async () => {
            const testCode = `TEST${Math.floor(1000 + Math.random() * 9000)}`;
            const testEmail = `john.doe.${Date.now()}@twiteai.com`;
            const newEmp = {
                employee_code: testCode,
                first_name: 'John',
                last_name: 'Doe',
                email: testEmail,
                phone: '+1 555-9999',
                department: 'Engineering',
                designation: 'Test Engineer',
                status: 'Active',
                hire_date: '2026-01-01'
            };

            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newEmp);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.employee_code).toEqual(testCode);

            createdEmployeeId = res.body.data.id;
        });

        test('GET /api/employees/:id - Should fetch single employee details', async () => {
            const res = await request(app)
                .get(`/api/employees/${createdEmployeeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.first_name).toEqual('John');
        });
    });

    // 3. Attendance API Tests
    describe('ATTENDANCE API (/api/attendance)', () => {
        test('POST /api/attendance - Should mark attendance for employee', async () => {
            const res = await request(app)
                .post('/api/attendance')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    employee_id: createdEmployeeId,
                    attendance_date: '2026-09-06',
                    check_in_time: '09:00',
                    check_out_time: '17:30',
                    status: 'Present',
                    notes: 'Unit test check-in'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toEqual('Present');
        });

        test('GET /api/attendance/summary - Should fetch summary stats', async () => {
            const res = await request(app)
                .get('/api/attendance/summary')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('attendancePercentage');
        });
    });

    // 4. Dashboard API Tests
    describe('DASHBOARD API (/api/dashboard)', () => {
        test('GET /api/dashboard/stats - Should fetch dashboard analytics', async () => {
            const res = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.summaryCards).toHaveProperty('totalEmployees');
            expect(res.body.data.summaryCards).toHaveProperty('presentToday');
        });
    });
});
