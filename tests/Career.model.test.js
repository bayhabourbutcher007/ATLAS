// Career Model Test
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Career = require('../src/models/Career');
const User = require('../src/models/User');

let mongod;

describe('Career Model', () => {
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
        await Career.deleteMany({});
        await User.deleteMany({});
    });

    it('should create and save a career record', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        const careerData = {
            userId: savedUser._id,
            currentPosition: {
                title: 'Software Engineer',
                company: 'Tech Corp',
                startDate: new Date('2023-01-15'),
                employmentType: 'full-time',
                location: 'New York, NY',
                remote: false,
                industry: 'Technology',
                salary: {
                    amount: 80000,
                    currency: 'USD',
                    frequency: 'annual'
                }
            },
            experience: [
                {
                    title: 'Junior Developer',
                    company: 'Startup Inc',
                    startDate: new Date('2021-06-01'),
                    endDate: new Date('2022-12-31'),
                    description: 'Developed web applications',
                    skillsUsed: ['JavaScript', 'React', 'Node.js']
                }
            ],
            education: [
                {
                    institution: 'State University',
                    degree: 'Bachelor of Science',
                    fieldOfStudy: 'Computer Science',
                    startDate: new Date('2017-09-01'),
                    endDate: new Date('2021-05-15'),
                    gpa: 3.5
                }
            ],
            certifications: [
                {
                    name: 'AWS Certified Developer',
                    issuer: 'Amazon Web Services',
                    date: new Date('2022-03-15'),
                    expiryDate: new Date('2025-03-15'),
                    credentialId: 'AWS123456789'
                }
            ],
            goals: [
                {
                    title: 'Get promoted to Senior Engineer',
                    description: 'Achieve senior level position within 2 years',
                    type: 'Other',
                    targetValue: 1,
                    currentValue: 0,
                    startDate: new Date(),
                    targetDate: new Date('2026-01-01'),
                    status: 'InProgress',
                    priority: 'High',
                    completed: false
                }
            ]
        };

        const career = new Career(careerData);
        const savedCareer = await career.save();

        expect(savedCareer._id).toBeDefined();
        expect(savedCareer.currentPosition.title).toBe('Software Engineer');
        expect(savedCareer.currentPosition.company).toBe('Tech Corp');
        expect(savedCareer.experience.length).toBe(1);
        expect(savedCareer.experience[0].title).toBe('Junior Developer');
        expect(savedCareer.education.length).toBe(1);
        expect(savedCareer.education[0].institution).toBe('State University');
        expect(savedCareer.certifications.length).toBe(1);
        expect(savedCareer.certifications[0].name).toBe('AWS Certified Developer');
        expect(savedCareer.goals.length).toBe(1);
        expect(savedCareer.goals[0].title).toBe('Get promoted to Senior Engineer');
    });

    it('should calculate total years of experience', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        const careerData = {
            userId: savedUser._id,
            experience: [
                {
                    title: 'Job 1',
                    company: 'Company A',
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2022-01-01'), // 2 years
                    description: 'First job',
                    skillsUsed: []
                },
                {
                    title: 'Job 2',
                    company: 'Company B',
                    startDate: new Date('2022-02-01'),
                    // endDate is null (current job)
                    description: 'Current job',
                    skillsUsed: []
                }
            ]
        };

        const career = new Career(careerData);
        await career.save();

        const years = career.getTotalExperience();
        // As of 2023, should be approximately 3 years (2020-2023)
        expect(years).toBeGreaterThanOrEqual(2);
        expect(years).toBeLessThanOrEqual(4);
    });
});
