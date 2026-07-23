// EmotionalState model test
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const EmotionalState = require('../src/models/EmotionalState');
const User = require('../src/models/User');

let mongod;

describe('EmotionalState Model', () => {
    beforeAll(async () => {
        // Create in-memory MongoDB instance
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        // Connect to the in-memory database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Disconnect and stop the in-memory MongoDB instance
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
    });

    beforeEach(async () => {
        // Clear collections before each test
        await EmotionalState.deleteMany({});
        await User.deleteMany({});
    });

    it('should create and save an emotional state record', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        const emotionalStateData = {
            userId: savedUser._id,
            timestamp: new Date('2026-07-23T10:00:00Z'),
            mood: {
                value: 3,
                label: 'happy'
            },
            stress: 45,
            energy: 70,
            focus: 80,
            notes: 'Feeling good today after completing a project',
            tags: ['productive', 'motivated']
        };

        const emotionalState = new EmotionalState(emotionalStateData);
        const savedEmotionalState = await emotionalState.save();

        expect(savedEmotionalState._id).toBeDefined();
        expect(savedEmotionalState.userId.toString()).toBe(savedUser._id.toString());
        expect(savedEmotionalState.timestamp.toISOString()).toBe('2026-07-23T10:00:00.000Z');
        expect(savedEmotionalState.mood.value).toBe(3);
        expect(savedEmotionalState.mood.label).toBe('happy');
        expect(savedEmotionalState.stress).toBe(45);
        expect(savedEmotionalState.energy).toBe(70);
        expect(savedEmotionalState.focus).toBe(80);
        expect(savedEmotionalState.notes).toBe('Feeling good today after completing a project');
        expect(savedEmotionalState.tags).toEqual(['productive', 'motivated']);
    });

    it('should validate mood value range', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        // Test minimum value (-5)
        let emotionalStateData = {
            userId: savedUser._id,
            timestamp: new Date(),
            mood: {
                value: -5,
                label: 'very_sad'
            },
            stress: 0,
            energy: 0,
            focus: 0
        };

        let emotionalState = new EmotionalState(emotionalStateData);
        let savedEmotionalState = await emotionalState.save();
        expect(savedEmotionalState.mood.value).toBe(-5);

        // Test maximum value (5)
        emotionalStateData.mood.value = 5;
        emotionalStateData.mood.label = 'very_happy';
        emotionalState = new EmotionalState(emotionalStateData);
        savedEmotionalState = await emotionalState.save();
        expect(savedEmotionalState.mood.value).toBe(5);

        // Test invalid value (-6)
        emotionalStateData.mood.value = -6;
        emotionalState = new EmotionalState(emotionalStateData);
        await expect(emotionalState.save()).rejects.toThrow();

        // Test invalid value (6)
        emotionalStateData.mood.value = 6;
        emotionalState = new EmotionalState(emotionalStateData);
        await expect(emotionalState.save()).rejects.toThrow();
    });

    it('should validate mood label enum', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser3',
            email: 'test3@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        // Test valid labels
        const validLabels = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'];
        for (const label of validLabels) {
            const emotionalStateData = {
                userId: savedUser._id,
                timestamp: new Date(),
                mood: {
                    value: 0,
                    label: label
                },
                stress: 0,
                energy: 0,
                focus: 0
            };

            const emotionalState = new EmotionalState(emotionalStateData);
            const savedEmotionalState = await emotionalState.save();
            expect(savedEmotionalState.mood.label).toBe(label);
        }

        // Test invalid label
        const emotionalStateData = {
            userId: savedUser._id,
            timestamp: new Date(),
            mood: {
                value: 0,
                label: 'ecstatic' // Invalid label
            },
            stress: 0,
            energy: 0,
            focus: 0
        };

        const emotionalState = new EmotionalState(emotionalStateData);
        await expect(emotionalState.save()).rejects.toThrow();
    });

    it('should validate stress, energy, and focus ranges (0-100)', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser4',
            email: 'test4@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        const testFields = ['stress', 'energy', 'focus'];
        for (const field of testFields) {
            // Test minimum value (0)
            let emotionalStateData = {
                userId: savedUser._id,
                timestamp: new Date(),
                mood: {
                    value: 0,
                    label: 'neutral'
                },
                stress: 0,
                energy: 0,
                focus: 0
            };
            emotionalStateData[field] = 0;

            let emotionalState = new EmotionalState(emotionalStateData);
            let savedEmotionalState = await emotionalState.save();
            expect(savedEmotionalState[field]).toBe(0);

            // Test maximum value (100)
            emotionalStateData[field] = 100;
            emotionalState = new EmotionalState(emotionalStateData);
            savedEmotionalState = await emotionalState.save();
            expect(savedEmotionalState[field]).toBe(100);

            // Test invalid value (-1)
            emotionalStateData[field] = -1;
            emotionalState = new EmotionalState(emotionalStateData);
            await expect(emotionalState.save()).rejects.toThrow();

            // Test invalid value (101)
            emotionalStateData[field] = 101;
            emotionalState = new EmotionalState(emotionalStateData);
            await expect(emotionalState.save()).rejects.toThrow();
        }
    });

    describe('toDTO method', () => {
        it('should convert document to DTO format', async () => {
            // Create a user first
            const user = new User({
                username: 'testuser5',
                email: 'test5@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            });

            const savedUser = await user.save();

            const emotionalStateData = {
                userId: savedUser._id,
                timestamp: new Date('2026-07-23T14:30:00Z'),
                mood: {
                    value: 2,
                    label: 'happy'
                },
                stress: 60,
                energy: 40,
                focus: 70,
                notes: 'Had a productive meeting',
                tags: ['work', 'focused']
            };

            const emotionalState = new EmotionalState(emotionalStateData);
            const savedEmotionalState = await emotionalState.save();

            const dto = savedEmotionalState.toDTO();

            expect(dto.timestamp).toBe('2026-07-23T14:30:00.000Z');
            expect(dto.mood.value).toBe(2);
            expect(dto.mood.label).toBe('happy');
            expect(dto.stress).toBe(60);
            expect(dto.energy).toBe(40);
            expect(dto.focus).toBe(70);
            expect(dto.notes).toBe('Had a productive meeting');
            expect(dto.tags).toEqual(['work', 'focused']);
        });
    });
});