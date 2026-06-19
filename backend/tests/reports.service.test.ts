import { ReportsService } from "../src/services/reports.service";
import { AppDataSource } from "../src/config/database";

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue("OK"),
      on: jest.fn()
    };
  });
});

jest.mock("../src/config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe("ReportsService", () => {
  let reportsService: ReportsService;

  beforeEach(() => {
    reportsService = new ReportsService();
    jest.clearAllMocks();
  });

  describe("getDashboardStats - Admin", () => {
    it("should return comprehensive admin stats", async () => {
      const mockCount = jest.fn().mockResolvedValue(5);
      const mockFind = jest.fn().mockResolvedValue([
        { status: "Present", student: { id: 1 }, createdAt: new Date() },
        { status: "Absent", student: { id: 1 }, createdAt: new Date() },
        { status: "Present", student: { id: 2 }, createdAt: new Date(Date.now() - 86400000) } // Yesterday
      ]);

      (AppDataSource.getRepository as jest.Mock).mockReturnValue({
        count: mockCount,
        find: mockFind
      });

      const stats = await reportsService.getDashboardStats("Admin", 1);
      
      expect(stats.totalStudents).toBe(5);
      expect(stats.totalTeachers).toBe(5);
      expect(stats.totalDepartments).toBe(5);
      expect(stats.totalCourses).toBe(5);
      expect(stats.totalSubjects).toBe(5);
      expect(stats.totalDefaulters).toBe(1); // Student 1 has 50% attendance (1/2), < 75%
      expect(stats.attendancePercentage).toBe("66.67"); // 2/3 overall
    });
  });

  describe("getMonthlyReport", () => {
    it("should calculate monthly percentages and identify defaulters", async () => {
      const mockGetMany = jest.fn().mockResolvedValue([
        { status: "Present", student: { id: 1, firstName: "John", lastName: "Doe" }, createdAt: new Date(), classSession: { subject: { name: "Math" } } },
        { status: "Absent", student: { id: 1, firstName: "John", lastName: "Doe" }, createdAt: new Date(), classSession: { subject: { name: "Math" } } }
      ]);
      const mockAndWhere = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLeftJoinAndSelect = jest.fn().mockReturnThis();
      
      const mockQueryBuilder = {
        leftJoinAndSelect: mockLeftJoinAndSelect,
        where: mockWhere,
        andWhere: mockAndWhere,
        getMany: mockGetMany
      };

      (AppDataSource.getRepository as jest.Mock).mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder)
      });

      const report = await reportsService.getMonthlyReport(10, 2026, 1, "3");
      
      expect(report.length).toBe(2);
      expect(report[0].isDefaulter).toBe(true); // 50% < 75%
      expect(report[0].monthAttendancePercentage).toBe("50.00");
    });
  });

  describe("getAttendanceTrends", () => {
    it("should aggregate attendance by date", async () => {
      const mockGetMany = jest.fn().mockResolvedValue([
        { status: "Present", createdAt: new Date("2026-10-01T10:00:00Z") },
        { status: "Absent", createdAt: new Date("2026-10-01T11:00:00Z") },
        { status: "Present", createdAt: new Date("2026-10-02T10:00:00Z") },
      ]);
      const mockWhere = jest.fn().mockReturnThis();
      
      const mockQueryBuilder = {
        where: mockWhere,
        getMany: mockGetMany
      };

      (AppDataSource.getRepository as jest.Mock).mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder)
      });

      const trends = await reportsService.getAttendanceTrends(10, 2026);
      
      expect(trends.labels.length).toBe(2);
      expect(trends.labels[0]).toBe("2026-10-01");
      expect(trends.labels[1]).toBe("2026-10-02");
      expect(trends.data[0]).toBe(50); // 1 present, 1 absent
      expect(trends.data[1]).toBe(100); // 1 present
    });
  });
});
