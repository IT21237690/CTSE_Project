const request = require('supertest');
const app = require('../../server');  // Import the app you export in server.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock User model and bcrypt methods
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('mongoose', () => {
  const mModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  };

  const mSchema = jest.fn().mockReturnValue(mModel);

  return {
    connect: jest.fn().mockResolvedValue(true), // Mock Mongoose's connect method
    disconnect: jest.fn().mockResolvedValue(true), // Mock Mongoose's disconnect method
    Schema: mSchema,  // Mock the Schema constructor
    model: jest.fn().mockReturnValue(mModel),  // Mock the model function
  };
});

describe('User Controller', () => {
  
  // Mock Data
  const mockUser = {
    _id: '1',
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'hashedPassword',
    grade: 'A',
    role: 'user',
  };

  beforeEach(() => {
    // Reset mocks before each test
    User.findOne.mockReset();
    User.prototype.save.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
    jwt.sign.mockReset();
  });

  // Test case for user registration
  describe('POST /auth/add/user', () => {
    it('should successfully register a new user', async () => {
      // Mock the necessary functions
      User.findOne.mockResolvedValue(null); // No user exists
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.prototype.save.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/auth/add/user')  // Correct route (keeping your route structure)
        .send({
          firstname: 'John',
          lastname: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          grade: 'A',
          role: 'user',
        });

      expect(res.status).toBe(201);
      expect(res.body.msg).toBe('User registered successfully');
      expect(res.body.user).toHaveProperty('email', 'john@example.com');
    });

    it('should return error if email or username already exists', async () => {
      // Mock existing user found
      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/auth/add/user')  // Correct route (keeping your route structure)
        .send({
          firstname: 'John',
          lastname: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          grade: 'A',
          role: 'user',
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Email or Username already exists');
    });
  });

  // Test case for user login
  describe('POST /auth/login', () => {
    it('should log in a user and return a JWT token', async () => {
      // Mocking User and bcrypt
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Password matches

      // Mock JWT generation
      jwt.sign.mockReturnValue('fake-jwt-token');

      const res = await request(app)
        .post('/auth/login')  // Correct route for login
        .send({
          username: 'johndoe',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Login successful');
      expect(res.body.token).toBe('fake-jwt-token');
    });

    it('should return error if credentials are invalid', async () => {
      // Mocking invalid user login
      User.findOne.mockResolvedValue(null); // No user found

      const res = await request(app)
        .post('/auth/login')  // Correct route for login
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Invalid credentials');
    });
  });

  // Test case for getting user profile
  describe('GET /users/profile', () => {
    it('should return the logged-in user profile', async () => {
      // Mocking JWT verification middleware
      const mockReq = {
        user: { id: mockUser._id },
      };

      // Mock findById to return user profile
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/users/profile')  // Correct route for profile
        .set('Authorization', 'Bearer fake-jwt-token'); // Include JWT in headers

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'john@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return error if profile retrieval fails', async () => {
      // Mocking failed profile retrieval
      User.findById.mockRejectedValue(new Error('Failed to retrieve user profile'));

      const res = await request(app)
        .get('/users/profile')  // Correct route for profile
        .set('Authorization', 'Bearer fake-jwt-token'); // Include JWT in headers

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to retrieve user profile');
    });
  });

  // Test case for user logout
  describe('POST /users/logout', () => {
    it('should log out the user successfully', async () => {
      const res = await request(app)
        .post('/users/logout')  // Correct route for logout
        .set('Authorization', 'Bearer fake-jwt-token');  // Include JWT in headers

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Logged out successfully');
    });
  });
});
