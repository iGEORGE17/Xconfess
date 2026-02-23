import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnonymousConfession } from '../src/confession/entities/confession.entity';
import { Report } from '../src/admin/entities/report.entity';
import { User } from '../src/user/entities/user.entity';

describe('Report Endpoint (e2e)', () => {
  let app: INestApplication;
  let confessionRepository: Repository<AnonymousConfession>;
  let reportRepository: Repository<Report>;
  let userRepository: Repository<User>;
  let testConfession: AnonymousConfession;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    confessionRepository = app.get(getRepositoryToken(AnonymousConfession));
    reportRepository = app.get(getRepositoryToken(Report));
    userRepository = app.get(getRepositoryToken(User));
  });

  beforeEach(async () => {
    // Clean up test data
    await reportRepository.delete({});
    await confessionRepository.delete({});
    await userRepository.delete({});

    // Create test confession
    testConfession = await confessionRepository.save({
      content: 'Test confession content for reporting',
      category: 'general',
    });

    // Create test user
    testUser = await userRepository.save({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /confessions/:id/report should create report for authenticated user', async () => {
    const reportData = {
      type: 'inappropriate',
      reason: 'This content is inappropriate',
    };

    const response = await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .set('Authorization', `Bearer valid-jwt-token`) // Note: In real test, you'd need proper JWT
      .send(reportData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.confessionId).toBe(testConfession.id);
    expect(response.body.type).toBe(reportData.type);
    expect(response.body.reason).toBe(reportData.reason);
    expect(response.body.status).toBe('pending');
  });

  it('POST /confessions/:id/report should create report for anonymous user', async () => {
    const reportData = {
      type: 'spam',
      reason: 'This appears to be spam content',
    };

    const response = await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .send(reportData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.confessionId).toBe(testConfession.id);
    expect(response.body.type).toBe(reportData.type);
    expect(response.body.reason).toBe(reportData.reason);
    expect(response.body.status).toBe('pending');
    expect(response.body.reporterId).toBeNull();
  });

  it('POST /confessions/:id/report should return 404 for non-existent confession', async () => {
    const reportData = {
      type: 'inappropriate',
      reason: 'This content is inappropriate',
    };

    await request(app.getHttpServer())
      .post('/confessions/non-existent-id/report')
      .send(reportData)
      .expect(404);
  });

  it('POST /confessions/:id/report should prevent duplicate reports within 24 hours', async () => {
    const reportData = {
      type: 'inappropriate',
      reason: 'This content is inappropriate',
    };

    // First report should succeed
    await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .send(reportData)
      .expect(201);

    // Second report should fail
    await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .send(reportData)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('already reported');
      });
  });

  it('POST /confessions/:id/report should validate request body', async () => {
    // Test missing required fields
    await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .send({})
      .expect(400);

    // Test invalid report type
    await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .send({
        type: 'invalid-type',
        reason: 'Some reason',
      })
      .expect(400);
  });

  it('should verify AnonymousConfession repository is available in ReportsService', async () => {
    // This test verifies that the DI issue is fixed by checking that
    // the ReportsService can properly access the AnonymousConfession repository
    const reportsService = app.get('ReportsService');
    
    expect(reportsService).toBeDefined();
    
    // Try to use the service which internally uses AnonymousConfession repository
    const reportData = {
      type: 'inappropriate',
      reason: 'Test DI verification',
    };

    const response = await request(app.getHttpServer())
      .post(`/confessions/${testConfession.id}/report`)
      .send(reportData)
      .expect(201);

    expect(response.body).toBeDefined();
  });
});
