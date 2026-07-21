// Academic Progress Model Test
const mongoose = require('mongoose');
const AcademicProgress = require('../src/models/AcademicProgress');
const User = require('../src/models/User');

describe('AcademicProgress Model', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atlas_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Clear database and disconnect
        await AcademicProgress.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear collections before each test
        await AcademicProgress.deleteMany({});
        await User.deleteMany({});
    });

    it('should create and save an academic progress record', async () => {
        // Create a user first
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        // Create academic progress record
        const academicProgress = new AcademicProgress({
            userId: savedUser._id,
            academicTerm: {
                term: 'Fall',
                year: 2026
            },
            courses: [{
                courseId: 'CS101',
                courseName: 'Introduction to Computer Science',
                courseCode: 'CS 101',
                credits: 3,
                instructor: 'Dr. Smith',
                term: 'Fall',
                year: 2026,
                status: 'Enrolled'
            }]
        });

        const savedAcademicProgress = await academicProgress.save();

        expect(savedAcademicProgress._id).toBeDefined();
        expect(savedAcademicProgress.userId.toString()).toBe(savedUser._id.toString());
        expect(savedAcademicProgress.academicTerm.term).toBe('Fall');
        expect(savedAcademicProgress.academicTerm.year).toBe(2026);
        expect(savedAcademicProgress.courses.length).toBe(1);
        expect(savedAcademicProgress.courses[0].courseName).toBe('Introduction to Computer Science');
    });

    it('should calculate GPA correctly', async () => {
        // Create a user
        const user = new User({
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        // Create academic progress with courses
        const academicProgress = new AcademicProgress({
            userId: savedUser._id,
            academicTerm: {
                term: 'Spring',
                year: 2026
            },
            courses: [
                {
                    courseId: 'MATH101',
                    courseName: 'Calculus I',
                    credits: 4,
                    grade: 'A', // 4.0 grade points
                    status: 'Completed'
                },
                {
                    courseId: 'ENG101',
                    courseName: 'English Composition',
                    credits: 3,
                    grade: 'B+', // 3.3 grade points
                    status: 'Completed'
                }
            ]
        });

        const savedAcademicProgress = await academicProgress.save();

        // Calculate GPA: (4.0*4 + 3.3*3) / (4+3) = (16 + 9.9) / 7 = 25.9 / 7 = 3.7
        const gpa = academicProgress.calculateGPA();
        expect(parseFloat(gpa.toFixed(2))).toBe(3.7);
    });

    it('should track study hours correctly', async () => {
        // Create a user
        const user = new User({
            username: 'testuser3',
            email: 'test3@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });

        const savedUser = await user.save();

        // Create academic progress
        const academicProgress = new AcademicProgress({
            userId: savedUser._id,
            academicTerm: {
                term: 'Winter',
                year: 2026
            },
            courses: [{
                courseId: 'PHYS101',
                courseName: 'Physics I',
                credits: 4,
                status: 'Enrolled'
            }]
        });

        const savedAcademicProgress = await academicProgress.save();

        // Add study hours
        await AcademicProgress.findOneAndUpdate(
            { userId: savedUser._id },
            {
                $inc: {
                    'studyHours.total': 120, // 2 hours
                    'studyHours.weekly': 120,
                    'studyHours.monthly': 120
                },
                $push: {
                    'studyHours.byCourse': {
                        courseId: 'PHYS101',
                        minutes: 120
                    }
                },
                $set: {
                    'studyHours.lastUpdated': new Date()
                }
            }
        );

        const updatedAcademicProgress = await AcademicProgress.findOne({ userId: savedUser._id });

        expect(updatedAcademicProgress.studyHours.total).toBe(120);
        expect(updatedAcademicProgress.studyHours.weekly).toBe(120);
        expect(updatedAcademicProgress.studyHours.monthly).toBe(120);
        expect(updatedAcademicProgress.studyHours.byCourse.length).toBe(1);
        expect(updatedAcademicProgress.studyHours.byCourse[0].minutes).toBe(120);
    });
});