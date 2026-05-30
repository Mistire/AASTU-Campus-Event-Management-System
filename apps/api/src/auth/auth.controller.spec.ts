import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      signUp: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: { get: jest.fn() } }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signUp', async () => {
      const dto = { fullName: 'Test', email: 'test@example.com', password: 'Password123!', phone: '123' };
      authService.signUp.mockResolvedValueOnce({ access_token: 'token' });
      const req = { ip: '127.0.0.1', headers: { 'user-agent': 'test' } };
      
      const result = await controller.signup(dto, req as any);
      expect(result).toHaveProperty('access_token');
      expect(authService.signUp).toHaveBeenCalledWith(dto, { ip: '127.0.0.1', userAgent: 'test' });
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };
      authService.login.mockResolvedValueOnce({ access_token: 'token' });
      const req = { ip: '127.0.0.1', headers: { 'user-agent': 'test' } };

      const result = await controller.login(dto, req as any);
      expect(result).toHaveProperty('access_token');
      expect(authService.login).toHaveBeenCalledWith(dto, { ip: '127.0.0.1', userAgent: 'test' });
    });
  });
});
