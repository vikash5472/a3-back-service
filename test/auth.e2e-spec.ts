import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { OtpService } from './../src/auth/otp.service';
import { SmsService } from './../src/common/sms.service';
import { SendgridService } from './../src/common/sendgrid.service';
import { UserService } from './../src/user/user.service';
import { UserDocument } from './../src/user/schemas/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

// Mock NodeCache
const mockCache = new Map();
const mockNodeCache = {
  get: jest.fn((key) => mockCache.get(key)),
  set: jest.fn((key, value, ttl) => mockCache.set(key, value)),
  del: jest.fn((key) => mockCache.delete(key)),
  has: jest.fn((key) => mockCache.has(key)),
};

// Mock SmsService
const mockSmsService = {
  sendSms: jest.fn(() => true),
};

// Mock SendgridService
const mockSendgridService = {
  sendMail: jest.fn(() => true),
};

// Mock UserService
const mockUsers = [];
const mockUserService = {
  findOne: jest.fn((identifier: string) => {
    return mockUsers.find(u => u.email === identifier || u.phoneNumber === identifier);
  }),
  create: jest.fn((user: any) => {
    const newUser = { _id: 'mockUserId' + (mockUsers.length + 1), ...user, save: jest.fn(() => newUser) };
    mockUsers.push(newUser);
    return newUser;
  }),
  updateAppJwtToken: jest.fn((userId: string, token: string) => {
    const user = mockUsers.find(u => u._id === userId);
    if (user) {
      user.appJwtToken = token;
      return user;
    }
    return null;
  }),
  updateUser: jest.fn((userId: string, update: any) => {
    const user = mockUsers.find(u => u._id === userId);
    if (user) {
      Object.assign(user, update);
      return user;
    }
    return null;
  }),
  findByEmailVerificationToken: jest.fn((token: string) => {
    return mockUsers.find(u => u.emailVerificationToken === token);
  }),
};

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let otpService: OtpService;
  let userService: UserService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    mockUsers.splice(0); // Clear mock users before each test
    mockCache.clear(); // Clear cache before each test
    jest.clearAllMocks(); // Clear all mock calls

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OtpService)
      .useValue({ ...mockNodeCache, sendOtp: jest.fn(), verifyOtp: jest.fn() }) // Mock OtpService methods
      .overrideProvider(SmsService)
      .useValue(mockSmsService)
      .overrideProvider(SendgridService)
      .useValue(mockSendgridService)
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overrideProvider(getModelToken('User')) // Mock Mongoose User Model
      .useValue(mockUserService) // Use mockUserService for model operations
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    otpService = moduleFixture.get<OtpService>(OtpService);
    userService = moduleFixture.get<UserService>(UserService);
    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken('User'));
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Phone OTP Authentication Tests ---
  describe('Phone OTP Authentication', () => {
    const testPhoneNumber = '+15551234567';
    const testOtp = '1234';

    it('should send OTP successfully', async () => {
      jest.spyOn(otpService, 'sendOtp').mockResolvedValue(true);
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ phoneNumber: testPhoneNumber })
        .expect(HttpStatus.OK)
        .expect({ message: 'OTP sent successfully' });
      expect(otpService.sendOtp).toHaveBeenCalledWith(testPhoneNumber);
    });

    it('should return BadRequestException if OTP sending fails', async () => {
      jest.spyOn(otpService, 'sendOtp').mockResolvedValue(false);
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ phoneNumber: testPhoneNumber })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should login with OTP successfully (new user)', async () => {
      jest.spyOn(otpService, 'verifyOtp').mockResolvedValue(true);
      jest.spyOn(userService, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userService, 'create').mockImplementation((user) => {
        const newUser = { _id: 'newUserId1', ...user, save: jest.fn(() => newUser) };
        mockUsers.push(newUser);
        return newUser;
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login-otp')
        .send({ phoneNumber: testPhoneNumber, otp: testOtp })
        .expect(HttpStatus.CREATED);

      expect(otpService.verifyOtp).toHaveBeenCalledWith(testPhoneNumber, testOtp);
      expect(userService.findOne).toHaveBeenCalledWith(testPhoneNumber);
      expect(userService.create).toHaveBeenCalledWith({ phoneNumber: testPhoneNumber });
      expect(response.body).toHaveProperty('access_token');
    });

    it('should login with OTP successfully (existing user)', async () => {
      const existingUser = { _id: 'existingUserId1', phoneNumber: testPhoneNumber, save: jest.fn() };
      mockUsers.push(existingUser);

      jest.spyOn(otpService, 'verifyOtp').mockResolvedValue(true);
      jest.spyOn(userService, 'findOne').mockResolvedValue(existingUser);

      const response = await request(app.getHttpServer())
        .post('/auth/login-otp')
        .send({ phoneNumber: testPhoneNumber, otp: testOtp })
        .expect(HttpStatus.CREATED);

      expect(otpService.verifyOtp).toHaveBeenCalledWith(testPhoneNumber, testOtp);
      expect(userService.findOne).toHaveBeenCalledWith(testPhoneNumber);
      expect(userService.create).not.toHaveBeenCalled();
      expect(response.body).toHaveProperty('access_token');
    });

    it('should return UnauthorizedException for invalid OTP', async () => {
      jest.spyOn(otpService, 'verifyOtp').mockResolvedValue(false);
      await request(app.getHttpServer())
        .post('/auth/login-otp')
        .send({ phoneNumber: testPhoneNumber, otp: 'wrong_otp' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  // --- User Linking Tests ---
  describe('User Linking', () => {
    let authenticatedUserToken: string;
    let authenticatedUser: any;

    beforeEach(async () => {
      // Simulate a logged-in user
      authenticatedUser = { _id: 'authUserId1', email: 'auth@example.com', appJwtToken: 'mockToken', save: jest.fn() };
      mockUsers.push(authenticatedUser);
      authenticatedUserToken = 'Bearer mockToken';
    });

    it('should link a phone number successfully', async () => {
      const newPhoneNumber = '+15559876543';
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(undefined); // Phone not found
      jest.spyOn(userService, 'updateUser').mockResolvedValueOnce({ ...authenticatedUser, phoneNumber: newPhoneNumber });

      await request(app.getHttpServer())
        .post('/auth/link-phone')
        .set('Authorization', authenticatedUserToken)
        .send({ phoneNumber: newPhoneNumber })
        .expect(HttpStatus.OK)
        .expect({ message: 'Phone number linked successfully', user: { ...authenticatedUser, phoneNumber: newPhoneNumber } });

      expect(userService.findOne).toHaveBeenCalledWith(newPhoneNumber);
      expect(userService.updateUser).toHaveBeenCalledWith(authenticatedUser._id, { phoneNumber: newPhoneNumber });
    });

    it('should return BadRequestException if phone number already exists', async () => {
      const existingPhoneNumber = '+15559876543';
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce({ _id: 'otherUser', phoneNumber: existingPhoneNumber });

      await request(app.getHttpServer())
        .post('/auth/link-phone')
        .set('Authorization', authenticatedUserToken)
        .send({ phoneNumber: existingPhoneNumber })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should send verification email for linking email successfully', async () => {
      const newEmail = 'new@example.com';
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(undefined); // Email not found
      jest.spyOn(userService, 'updateUser').mockResolvedValueOnce({ ...authenticatedUser, tempEmail: newEmail, emailVerificationToken: 'mockToken' });
      jest.spyOn(sendgridService, 'sendMail').mockResolvedValue(true);

      await request(app.getHttpServer())
        .post('/auth/link-email')
        .set('Authorization', authenticatedUserToken)
        .send({ email: newEmail })
        .expect(HttpStatus.OK)
        .expect({ message: 'Verification email sent. Please check your inbox.' });

      expect(userService.findOne).toHaveBeenCalledWith(newEmail);
      expect(userService.updateUser).toHaveBeenCalledWith(authenticatedUser._id, expect.objectContaining({ tempEmail: newEmail, emailVerificationToken: expect.any(String) }));
      expect(sendgridService.sendMail).toHaveBeenCalledWith(
        newEmail,
        'Verify your email address',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should return BadRequestException if email already exists', async () => {
      const existingEmail = 'existing@example.com';
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce({ _id: 'otherUser', email: existingEmail });

      await request(app.getHttpServer())
        .post('/auth/link-email')
        .set('Authorization', authenticatedUserToken)
        .send({ email: existingEmail })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should verify email successfully', async () => {
      const verificationToken = 'validVerificationToken';
      const userToVerify = { _id: 'verifyUser', tempEmail: 'temp@example.com', emailVerificationToken: verificationToken, save: jest.fn() };
      jest.spyOn(userService, 'findByEmailVerificationToken').mockResolvedValueOnce(userToVerify);

      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(HttpStatus.OK)
        .expect({ message: 'Email verified successfully' });

      expect(userService.findByEmailVerificationToken).toHaveBeenCalledWith(verificationToken);
      expect(userToVerify.email).toBe('temp@example.com');
      expect(userToVerify.tempEmail).toBeUndefined();
      expect(userToVerify.emailVerificationToken).toBeUndefined();
      expect(userToVerify.save).toHaveBeenCalled();
    });

    it('should return BadRequestException for invalid email verification token', async () => {
      jest.spyOn(userService, 'findByEmailVerificationToken').mockResolvedValueOnce(null);

      await request(app.getHttpServer())
        .get('/auth/verify-email?token=invalidToken')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // --- JWT Invalidation Test ---
  describe('JWT Invalidation', () => {
    it('should invalidate token if appJwtToken changes', async () => {
      const user = { _id: 'testUser1', email: 'test@example.com', appJwtToken: 'initialToken', save: jest.fn() };
      mockUsers.push(user);

      // Simulate login and get a token
      jest.spyOn(otpService, 'verifyOtp').mockResolvedValue(true);
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(userService, 'updateAppJwtToken').mockImplementation((userId, token) => {
        user.appJwtToken = token;
        return user;
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login-otp')
        .send({ phoneNumber: '+1234567890', otp: '1234' })
        .expect(HttpStatus.CREATED);

      const validToken = loginResponse.body.access_token;

      // Change the appJwtToken in the database (simulating a logout or password change)
      await userService.updateAppJwtToken(user._id, 'newTokenAfterLogout');

      // Try to access a protected route with the old token
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
