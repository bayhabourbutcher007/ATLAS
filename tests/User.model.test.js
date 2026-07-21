// User model test example
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('User Model', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/atlas_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterAll(async () => {
        // Clean up and disconnect
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear users collection before each test
        await User.deleteMany({});
    });

    describe('User Creation', () => {
        test('should create a new user with valid data', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            };

            const user = new User(userData);
            const savedUser = await user.save();

            expect(savedUser._id).toBeDefined();
            expect(savedUser.username).toBe(userData.username);
            expect(savedUser.email).toBe(userData.email);
            expect(savedUser.firstName).toBe(userData.firstName);
            expect(savedUser.lastName).toBe(userData.lastName);
            expect(savedUser.password).not.toBe(userData.password); // Should be hashed
        });

        test('should not create user with duplicate email', async () => {
            const userData = {
                username: 'testuser1',
                email: 'test@example.com',
                password: 'password123'
            };

            // Create first user
            await new User(userData).save();

            // Try to create second user with same email
            const userData2 = {
                username: 'testuser2',
                email: 'test@example.com', // Same email
                password: 'password456'
            };

            const user = new User(userData2);
            await expect(user.save()).rejects.toThrow();
        });

        test('should not create user with invalid email', async () => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123'
            };

            const user = new User(userData);
            await expect(user.save()).rejects.toThrow();
        });
    });

    describe('Password Handling', () => {
        test('should hash password before saving', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'plaintextpassword'
            };

            const user = new User(userData);
            const savedUser = await user.save();

            expect(savedUser.password).not.toBe(userData.password);
            expect(savedUser.password.length).toBeGreaterThan(userData.password.length);
        });

        test('should compare password correctly', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            const user = new User(userData);
            const savedUser = await user.save();

            const isMatch = await user.comparePassword('password123');
            expect(isMatch).toBe(true);

            const isNotMatch = await user.comparePassword('wrongpassword');
            expect(isNotMatch).toBe(false);
        });
    });

    describe('Public Profile', () => {
        test('should return public profile without sensitive data', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            };

            const user = new User(userData);
            const savedUser = await user.save();
            const publicProfile = user.getPublicProfile();

            expect(publicProfile).toHaveProperty('_id');
            expect(publicProfile).toHaveProperty('username', userData.username);
            expect(publicProfile).toHaveProperty('email', userData.email);
            expect(publicProfile).toHaveProperty('firstName', userData.firstName);
            expect(publicProfile).toHaveProperty('lastName', userData.lastName);
            expect(publicProfile).not.toHaveProperty('password');
            expect(publicProfile).not.toHaveProperty('__v');
        });
    });
});