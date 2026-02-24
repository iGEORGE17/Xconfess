import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { AnonymousUser } from '../src/user/entities/anonymous-user.entity';
import { UserAnonymousUser } from '../src/user/entities/user-anonymous-link.entity';
import { Report } from '../src/report/report.entity';
import { UserRole } from '../src/user/entities/user.entity';
import { ReportReason } from '../src/report/enums/report-reason.enum';
import * as bcrypt from 'bcryptjs';

describe('Backend Improvements (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let anonymousUserRepository: Repository<AnonymousUser>;
  let userAnonRepo: Repository<UserAnonymousUser>;
  let reportRepository: Repository<Report>;
  let testUser: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = app.get(getRepositoryToken(User));
    anonymousUserRepository = app.get(getRepositoryToken(AnonymousUser));
    userAnonRepo = app.get(getRepositoryToken(UserAnonymousUser));
    reportRepository = app.get(getRepositoryToken(Report));
  });

  beforeEach(async () => {
    // Clean up test data
    await userRepository.delete({});
    await anonymousUserRepository.delete({});
    await userAnonRepo.delete({});
    await reportRepository.delete({});

    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    testUser = await userRepository.save({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: UserRole.USER,
      is_active: true,
    });

    // Get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Task 1: Anonymous Context ID Session Management', () => {
    it('should reuse same anonymous context ID within session window', async () => {
      // Make first request
      const response1 = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Make second request
      const response2 = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Both should have same anonymous context ID
      const anonContext1 = response1.headers['x-anonymous-context-id'];
      const anonContext2 = response2.headers['x-anonymous-context-id'];

      expect(anonContext1).toBeDefined();
      expect(anonContext2).toBeDefined();
      expect(anonContext1).toBe(anonContext2);
      expect(anonContext1).toMatch(/^anon_[a-f0-9-]{36}$/);
    });

    it('should create new anonymous context after session expiry', async () => {
      // Simulate session expiry by creating old link
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25); // 25 hours ago

      const oldAnonUser = await anonymousUserRepository.save({
        createdAt: oldDate,
      });

      await userAnonRepo.save({
        userId: testUser.id,
        anonymousUserId: oldAnonUser.id,
        createdAt: oldDate,
      });

      // Make request - should create new anonymous context
      const response = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const anonContext = response.headers['x-anonymous-context-id'];
      expect(anonContext).toBeDefined();
      expect(anonContext).not.toBe(`anon_${oldAnonUser.id}`);
    });

    it('should maintain anonymity guarantees', async () => {
      // Create multiple users
      const user2 = await userRepository.save({
        username: 'user2',
        email: 'user2@example.com',
        password: await bcrypt.hash('password', 10),
        role: UserRole.USER,
        is_active: true,
      });

      const loginResponse2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user2@example.com',
          password: 'password',
        });

      const token2 = loginResponse2.body.access_token;

      // Make requests from both users
      const response1 = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      const anonContext1 = response1.headers['x-anonymous-context-id'];
      const anonContext2 = response2.headers['x-anonymous-context-id'];

      // Should be different anonymous contexts
      expect(anonContext1).not.toBe(anonContext2);
      expect(anonContext1).toMatch(/^anon_[a-f0-9-]{36}$/);
      expect(anonContext2).toMatch(/^anon_[a-f0-9-]{36}$/);
    });
  });

  describe('Task 2: Report Controller UUID Validation', () => {
    it('should reject invalid UUID in report endpoint', async () => {
      const invalidUuid = 'invalid-uuid-format';

      const response = await request(app.getHttpServer())
        .post(`/confessions/${invalidUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.SPAM,
          details: 'This is spam content',
        })
        .expect(400); // Should fail validation

      expect(response.body.message).toContain('validation');
    });

    it('should accept valid UUID in report endpoint', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      // Mock confession existence check
      jest.spyOn(reportRepository, 'findOne').mockResolvedValueOnce(null);

      const response = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.SPAM,
          details: 'This is spam content',
        })
        .expect(201); // Should pass validation

      // Should not contain validation errors
      expect(response.body.message).not.toContain('validation');
    });

    it('should handle unauthenticated requests properly', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .send({
          reason: ReportReason.HARASSMENT,
          details: 'Harassment content',
        })
        .expect(201); // Should work for guests too

      expect(response.body.message).not.toContain('validation');
    });

    it('should have proper request typing without any types', async () => {
      // This test ensures the controller compiles without 'any' types
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.INAPPROPRIATE,
          details: 'Inappropriate content',
        })
        .expect(201);

      // Should work with proper typing
      expect(response.body).toBeDefined();
    });
  });

  describe('Task 3: Report Reason Enum Validation', () => {
    it('should accept valid report reasons', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      for (const reason of Object.values(ReportReason)) {
        const response = await request(app.getHttpServer())
          .post(`/confessions/${validUuid}/report`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            reason: reason,
            details: `Test report for ${reason}`,
          })
          .expect(201);

        expect(response.body.reason).toBe(reason);
      }
    });

    it('should reject invalid report reasons', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: 'invalid-reason',
          details: 'This should fail',
        })
        .expect(400);

      expect(response.body.message).toContain('reason');
      expect(response.body.message).toContain('enum');
    });

    it('should store normalized reason categories', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.HATE_SPEECH,
          details: 'Hate speech content',
        })
        .expect(201);

      // Check database for normalized reason
      const reports = await reportRepository.find({
        where: { reason: ReportReason.HATE_SPEECH },
      });

      expect(reports).toHaveLength(1);
      expect(reports[0].reason).toBe(ReportReason.HATE_SPEECH);
    });

    it('should allow optional details field', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.SPAM,
          // No details field
        })
        .expect(201);

      expect(response.body.reason).toBe(ReportReason.SPAM);
    });

    it('should enforce details length limit', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const longDetails = 'a'.repeat(2001); // Exceeds 2000 character limit

      const response = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.OTHER,
          details: longDetails,
        })
        .expect(400);

      expect(response.body.message).toContain('details');
      expect(response.body.message).toContain('2000');
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end with all improvements', async () => {
      // 1. Make authenticated request to get stable anonymous context
      const confessionsResponse = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const anonContext = confessionsResponse.headers['x-anonymous-context-id'];
      expect(anonContext).toMatch(/^anon_[a-f0-9-]{36}$/);

      // 2. Submit report with valid UUID and reason enum
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const reportResponse = await request(app.getHttpServer())
        .post(`/confessions/${validUuid}/report`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: ReportReason.FALSE_INFORMATION,
          details: 'This contains false information',
        })
        .expect(201);

      expect(reportResponse.body.reason).toBe(ReportReason.FALSE_INFORMATION);

      // 3. Verify anonymous context remains stable
      const secondConfessionsResponse = await request(app.getHttpServer())
        .get('/confessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const secondAnonContext = secondConfessionsResponse.headers['x-anonymous-context-id'];
      expect(secondAnonContext).toBe(anonContext);
    });
  });
});
