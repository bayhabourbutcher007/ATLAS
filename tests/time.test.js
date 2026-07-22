// Time module tests
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Time = require('../src/models/Time');
const TimeService = require('../src/services/TimeService');
const TimeController = require('../src/controllers/timeController');
const ContextAggregator = require('../src/core/life-context/ContextAggregator');
// Import other services for mocking in integration test
const AcademicProgressService = require('../src/services/AcademicProgressService');
const UserService = require('../src/services/UserService');
const FinanceService = require('../src/services/financeService');
const SkillService = require('../src/services/skillService');
const HealthService = require('../src/services/HealthService');
const CareerService = require('../src/services/CareerService');

let mongod;

describe('Time Module', () => {
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
        await Time.deleteMany({});
    });

    describe('TimeService', () => {
        it('should return empty time snapshot when no data exists', async () => {
            const userId = new mongoose.Types.ObjectId();
            const snapshot = await TimeService.getTimeSnapshot(userId.toString());

            expect(snapshot).toEqual({
                calendar: [],
                timeZones: { home: null, work: null },
                availability: { slots: [] }
            });
        });

        it('should return time snapshot with data', async () => {
            const userId = new mongoose.Types.ObjectId();
            const timeData = {
                userId,
                calendar: [{
                    title: 'Test Event',
                    description: 'Test Description',
                    start: new Date('2026-07-23T10:00:00Z'),
                    end: new Date('2026-07-23T12:00:00Z'),
                    allDay: false,
                    location: 'Test Location',
                    attendees: ['user1@example.com', 'user2@example.com'],
                    recurrence: {
                        frequency: 'weekly',
                        interval: 1,
                        until: null,
                        byday: ['MO', 'WE', 'FR']
                    },
                    category: 'work'
                }],
                timeZones: {
                    home: 'America/New_York',
                    work: 'America/Los_Angeles'
                },
                availability: {
                    slots: [{
                        start: new Date('2026-07-23T09:00:00Z'),
                        end: new Date('2026-07-23T10:00:00Z'),
                        type: 'focus'
                    }]
                }
            };

            const timeDoc = new Time(timeData);
            await timeDoc.save();

            const snapshot = await TimeService.getTimeSnapshot(userId.toString());

            expect(snapshot.calendar).toHaveLength(1);
            expect(snapshot.calendar[0].title).toBe('Test Event');
            expect(snapshot.calendar[0].description).toBe('Test Description');
            expect(snapshot.calendar[0].start).toBe('2026-07-23T10:00:00.000Z');
            expect(snapshot.calendar[0].end).toBe('2026-07-23T12:00:00.000Z');
            expect(snapshot.calendar[0].allDay).toBe(false);
            expect(snapshot.calendar[0].location).toBe('Test Location');
            expect(snapshot.calendar[0].attendees).toEqual(['user1@example.com', 'user2@example.com']);
            expect(snapshot.calendar[0].recurrence).toEqual({
                frequency: 'weekly',
                interval: 1,
                until: null,
                byday: ['MO', 'WE', 'FR']
            });
            expect(snapshot.calendar[0].category).toBe('work');

            expect(snapshot.timeZones).toEqual({
                home: 'America/New_York',
                work: 'America/Los_Angeles'
            });

            expect(snapshot.availability.slots).toHaveLength(1);
            expect(snapshot.availability.slots[0].start).toBe('2026-07-23T09:00:00.000Z');
            expect(snapshot.availability.slots[0].end).toBe('2026-07-23T10:00:00.000Z');
            expect(snapshot.availability.slots[0].type).toBe('focus');
        });

        it('should update time zones via updateTime', async () => {
            const userId = new mongoose.Types.ObjectId();
            const timeZonesData = {
                home: 'Europe/London',
                work: 'Asia/Tokyo'
            };

            const updatedTime = await TimeService.updateTime(userId.toString(), { timeZones: timeZonesData });

            expect(updatedTime.timeZones.home).toBe('Europe/London');
            expect(updatedTime.timeZones.work).toBe('Asia/Tokyo');

            // Verify it's persisted
            const timeDoc = await Time.findOne({ userId });
            expect(timeDoc.timeZones.home).toBe('Europe/London');
            expect(timeDoc.timeZones.work).toBe('Asia/Tokyo');
        });

        it('should add a calendar event', async () => {
            const userId = new mongoose.Types.ObjectId();
            const eventData = {
                title: 'New Event',
                description: 'New Description',
                start: new Date('2026-07-24T14:00:00Z'),
                end: new Date('2026-07-24T16:00:00Z'),
                allDay: true,
                location: 'Conference Room',
                attendees: ['attendee1@example.com'],
                recurrence: {
                    frequency: 'monthly',
                    interval: 2,
                    until: new Date('2027-01-01'),
                    byday: ['TU', 'TH']
                },
                category: 'personal'
            };

            const updatedTime = await TimeService.addCalendarEvent(userId.toString(), eventData);

            expect(updatedTime.calendar).toHaveLength(1);
            const event = updatedTime.calendar[0];
            expect(event.title).toBe('New Event');
            expect(event.description).toBe('New Description');
            expect(event.start.toISOString()).toBe('2026-07-24T14:00:00.000Z');
            expect(event.end.toISOString()).toBe('2026-07-24T16:00:00.000Z');
            expect(event.allDay).toBe(true);
            expect(event.location).toBe('Conference Room');
            expect(event.attendees).toEqual(['attendee1@example.com']);
            // Recurrence is a Mongoose document; check fields
            expect(event.recurrence.frequency).toBe('monthly');
            expect(event.recurrence.interval).toBe(2);
            expect(event.recurrence.until).toEqual(new Date('2027-01-01'));
            expect(event.recurrence.byday).toEqual(['TU', 'TH']);
            expect(event.category).toBe('personal');
        });

        it('should update a calendar event', async () => {
            const userId = new mongoose.Types.ObjectId();
            const timeData = {
                userId,
                calendar: [{
                    title: 'Old Event',
                    description: 'Old Description',
                    start: new Date('2026-07-25T09:00:00Z'),
                    end: new Date('2026-07-25T11:00:00Z'),
                    allDay: false,
                    location: 'Old Location',
                    attendees: [],
                    recurrence: null,
                    category: 'work'
                }]
            };

            const timeDoc = new Time(timeData);
            await timeDoc.save();
            const eventId = timeDoc.calendar[0]._id.toString();

            const updateData = {
                title: 'Updated Event',
                description: 'Updated Description',
                start: new Date('2026-07-25T10:00:00Z'),
                end: new Date('2026-07-25T12:00:00Z'),
                location: 'Updated Location',
                category: 'personal'
            };

            const updatedTime = await TimeService.updateCalendarEvent(userId.toString(), eventId, updateData);

            expect(updatedTime.calendar).toHaveLength(1);
            const event = updatedTime.calendar[0];
            expect(event.title).toBe('Updated Event');
            expect(event.description).toBe('Updated Description');
            expect(event.start.toISOString()).toBe('2026-07-25T10:00:00.000Z');
            expect(event.end.toISOString()).toBe('2026-07-25T12:00:00.000Z');
            expect(event.location).toBe('Updated Location');
            expect(event.category).toBe('personal');
            // Check that unchanged fields remain
            expect(event.allDay).toBe(false);
            expect(event.attendees).toEqual([]);
            expect(event.recurrence).toBeNull();
        });

        it('should remove a calendar event', async () => {
            const userId = new mongoose.Types.ObjectId();
            const timeData = {
                userId,
                calendar: [{
                    title: 'Event 1',
                    start: new Date('2026-07-26T09:00:00Z'),
                    end: new Date('2026-07-26T10:00:00Z'),
                    category: 'work'
                },
                {
                    title: 'Event 2',
                    start: new Date('2026-07-26T11:00:00Z'),
                    end: new Date('2026-07-26T12:00:00Z'),
                    category: 'personal'
                }]
            };

            const timeDoc = new Time(timeData);
            await timeDoc.save();
            const eventIdToRemove = timeDoc.calendar[0]._id.toString();

            const updatedTime = await TimeService.removeCalendarEvent(userId.toString(), eventIdToRemove);

            expect(updatedTime.calendar).toHaveLength(1);
            expect(updatedTime.calendar[0].title).toBe('Event 2');
        });

        it('should add an availability slot', async () => {
            const userId = new mongoose.Types.ObjectId();
            const slotData = {
                start: new Date('2026-07-27T08:00:00Z'),
                end: new Date('2026-07-27T09:00:00Z'),
                type: 'break'
            };

            const updatedTime = await TimeService.addAvailabilitySlot(userId.toString(), slotData);

            expect(updatedTime.availability.slots).toHaveLength(1);
            const slot = updatedTime.availability.slots[0];
            expect(slot.start.toISOString()).toBe('2026-07-27T08:00:00.000Z');
            expect(slot.end.toISOString()).toBe('2026-07-27T09:00:00.000Z');
            expect(slot.type).toBe('break');
        });

        it('should update an availability slot', async () => {
            const userId = new mongoose.Types.ObjectId();
            const timeData = {
                userId,
                availability: {
                    slots: [{
                        start: new Date('2026-07-28T07:00:00Z'),
                        end: new Date('2026-07-28T08:00:00Z'),
                        type: 'focus'
                    }]
                }
            };

            const timeDoc = new Time(timeData);
            await timeDoc.save();
            const slotId = timeDoc.availability.slots[0]._id.toString();

            const updateData = {
                start: new Date('2026-07-28T07:30:00Z'),
                end: new Date('2026-07-28T08:30:00Z'),
                type: 'meeting'
            };

            const updatedTime = await TimeService.updateAvailabilitySlot(userId.toString(), slotId, updateData);

            expect(updatedTime.availability.slots).toHaveLength(1);
            const slot = updatedTime.availability.slots[0];
            expect(slot.start.toISOString()).toBe('2026-07-28T07:30:00.000Z');
            expect(slot.end.toISOString()).toBe('2026-07-28T08:30:00.000Z');
            expect(slot.type).toBe('meeting');
        });

        it('should remove an availability slot', async () => {
            const userId = new mongoose.Types.ObjectId();
            const timeData = {
                userId,
                availability: {
                    slots: [{
                        start: new Date('2026-07-29T08:00:00Z'),
                        end: new Date('2026-07-29T09:00:00Z'),
                        type: 'break'
                    },
                    {
                        start: new Date('2026-07-29T10:00:00Z'),
                        end: new Date('2026-07-29T11:00:00Z'),
                        type: 'personal'
                    }]
                }
            };

            const timeDoc = new Time(timeData);
            await timeDoc.save();
            const slotIdToRemove = timeDoc.availability.slots[0]._id.toString();

            const updatedTime = await TimeService.removeAvailabilitySlot(userId.toString(), slotIdToRemove);

            expect(updatedTime.availability.slots).toHaveLength(1);
            expect(updatedTime.availability.slots[0].type).toBe('personal');
        });
    });

    describe('TimeController', () => {
        let mockReq, mockRes;

        beforeEach(() => {
            mockReq = {
                user: { userId: new mongoose.Types.ObjectId().toString() },
                body: {},
                params: {}
            };

            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should get time snapshot', async () => {
            const userId = mockReq.user.userId;
            const expectedSnapshot = {
                calendar: [],
                timeZones: { home: null, work: null },
                availability: { slots: [] }
            };

            // Mock TimeService.getTimeSnapshot
            TimeService.getTimeSnapshot = jest.fn().mockResolvedValue(expectedSnapshot);

            await TimeController.getTimeSnapshot(mockReq, mockRes);

            expect(TimeService.getTimeSnapshot).toHaveBeenCalledWith(userId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Time snapshot retrieved successfully',
                data: expectedSnapshot
            });
        });

        it('should update time', async () => {
            const userId = mockReq.user.userId;
            const updates = { timeZones: { home: 'Europe/Paris' } };
            const expectedTime = {
                _id: new mongoose.Types.ObjectId(),
                userId,
                timeZones: { home: 'Europe/Paris', work: null },
                availability: { slots: [] },
                calendar: [],
                updatedAt: new Date()
            };

            mockReq.body = updates;

            // Mock TimeService.updateTime
            TimeService.updateTime = jest.fn().mockResolvedValue(expectedTime);

            await TimeController.updateTime(mockReq, mockRes);

            expect(TimeService.updateTime).toHaveBeenCalledWith(userId, updates);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Time updated successfully',
                data: expectedTime
            });
        });

        it('should add a calendar event', async () => {
            const userId = mockReq.user.userId;
            const eventData = {
                title: 'Controller Test Event',
                start: new Date('2026-07-30T09:00:00Z'),
                end: new Date('2026-07-30T10:00:00Z'),
                category: 'work'
            };

            const expectedTime = {
                _id: new mongoose.Types.ObjectId(),
                userId,
                calendar: [{
                    _id: new mongoose.Types.ObjectId(),
                    title: 'Controller Test Event',
                    start: new Date('2026-07-30T09:00:00Z'),
                    end: new Date('2026-07-30T10:00:00Z'),
                    category: 'work'
                }],
                timeZones: { home: null, work: null },
                availability: { slots: [] },
                updatedAt: new Date()
            };

            mockReq.body = eventData;

            // Mock TimeService.addCalendarEvent
            TimeService.addCalendarEvent = jest.fn().mockResolvedValue(expectedTime);

            await TimeController.addCalendarEvent(mockReq, mockRes);

            expect(TimeService.addCalendarEvent).toHaveBeenCalledWith(userId, eventData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Calendar event added successfully',
                data: expectedTime
            });
        });

        it('should handle errors in getTimeSnapshot', async () => {
            const userId = mockReq.user.userId;
            const errorMessage = 'Database error';

            // Mock TimeService.getTimeSnapshot to throw an error
            TimeService.getTimeSnapshot = jest.fn().mockRejectedValue(new Error(errorMessage));

            await TimeController.getTimeSnapshot(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve time snapshot',
                error: errorMessage
            });
        });
    });

    describe('ContextAggregator Integration', () => {
        it('should include time data from TimeService in the context snapshot', async () => {
            const userId = new mongoose.Types.ObjectId().toString();

            // Mock the dependencies
            const mockAcademicDto = {};
            const mockUserDoc = {
                _id: new mongoose.Types.ObjectId(userId),
                username: 'testuser',
                email: 'TEST@EXAMPLE.COM',
                role: 'student',
                createdAt: new Date(),
                firstName: 'Test',
                lastName: 'User',
                bio: '',
                avatarUrl: '',
                institution: '',
                major: '',
                graduationYear: null,
                preferences: {
                    theme: 'system',
                    notifications: { email: false, push: false },
                    language: 'en'
                }
            };
            const mockFinanceDto = {};
            const mockSkillDto = {};
            const mockHealthDto = {};
            const mockCareerDto = {};
            const mockEmotionalStateDto = {
                timestamp: new Date().toISOString(),
                mood: { value: 0, label: 'neutral' },
                stress: 0,
                energy: 0,
                focus: 0,
                notes: '',
                tags: []
            };
            const mockMetadata = {
                generatedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            // Mock the services
            AcademicProgressService.getAcademicSnapshot = jest.fn().mockResolvedValue(mockAcademicDto);
            UserService.getUserById = jest.fn().mockResolvedValue(mockUserDoc);
            FinanceService.getFinanceSnapshot = jest.fn().mockResolvedValue(mockFinanceDto);
            SkillService.getSkillSnapshot = jest.fn().mockResolvedValue(mockSkillDto);
            HealthService.getHealthSnapshot = jest.fn().mockResolvedValue(mockHealthDto);
            CareerService.getCareerSnapshot = jest.fn().mockResolvedValue(mockCareerDto);

            // Mock TimeService.getTimeSnapshot to return specific time data
            const mockTimeDto = {
                calendar: [{
                    id: 'event1',
                    title: 'Integration Test Event',
                    description: 'Test description',
                    start: '2026-07-31T10:00:00.000Z',
                    end: '2026-07-31T12:00:00.000Z',
                    allDay: false,
                    location: 'Test Location',
                    attendees: ['test@example.com'],
                    recurrence: {
                        frequency: 'weekly',
                        interval: 1,
                        until: null,
                        byday: ['MO']
                    },
                    category: 'work'
                }],
                timeZones: { home: 'America/New_York', work: 'America/Los_Angeles' },
                availability: {
                    slots: [{
                        id: 'slot1',
                        start: '2026-07-31T09:00:00.000Z',
                        end: '2026-07-31T10:00:00.000Z',
                        type: 'focus'
                    }]
                }
            };
            TimeService.getTimeSnapshot = jest.fn().mockResolvedValue(mockTimeDto);

            // Call ContextAggregator.build
            const contextAgg = new ContextAggregator();
            const context = await contextAgg.build(userId);

            // Verify that the time data in the context matches what we mocked
            expect(context.time).toEqual(mockTimeDto);

            // Verify that other services were called
            expect(AcademicProgressService.getAcademicSnapshot).toHaveBeenCalledWith(userId);
            expect(UserService.getUserById).toHaveBeenCalledWith(userId);
            expect(FinanceService.getFinanceSnapshot).toHaveBeenCalledWith(userId);
            expect(SkillService.getSkillSnapshot).toHaveBeenCalledWith(userId);
            expect(HealthService.getHealthSnapshot).toHaveBeenCalledWith(userId);
            expect(CareerService.getCareerSnapshot).toHaveBeenCalledWith(userId);
            expect(TimeService.getTimeSnapshot).toHaveBeenCalledWith(userId);
        });
    });
});