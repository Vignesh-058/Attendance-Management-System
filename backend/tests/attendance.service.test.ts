import { AttendanceService } from "../src/services/attendance.service";
import { AppDataSource } from "../src/config/database";

jest.mock("../src/config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe("AttendanceService", () => {
  let attendanceService: AttendanceService;
  let mockRepo: any;

  beforeEach(() => {
    attendanceService = new AttendanceService();
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn()
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    jest.clearAllMocks();
  });

  describe("markAttendance", () => {
    it("should throw error if session already exists", async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 }) // Teacher
        .mockResolvedValueOnce({ id: 1 }) // Subject
        .mockResolvedValueOnce({ id: 1 }); // Existing session

      await expect(attendanceService.markAttendance(1, {
        subjectId: 1, date: "2026-10-10", startTime: "10:00", endTime: "11:00", attendanceData: []
      })).rejects.toThrow("A class session with this subject, date, and time already exists.");
    });

    it("should create session and records successfully", async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 }) // Teacher
        .mockResolvedValueOnce({ id: 1 }) // Subject
        .mockResolvedValueOnce(null); // No existing session

      const mockSession = { id: 10 };
      mockRepo.create.mockReturnValue(mockSession);
      
      const result = await attendanceService.markAttendance(1, {
        subjectId: 1, 
        date: "2026-10-10", 
        startTime: "10:00", 
        endTime: "11:00", 
        attendanceData: [{ studentId: 1, status: "Present" }]
      });

      expect(result.message).toBe("Attendance marked successfully");
      expect(result.sessionId).toBe(10);
      expect(mockRepo.save).toHaveBeenCalledTimes(2); // Once for session, once for records
    });
  });
});
