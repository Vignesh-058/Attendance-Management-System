import { AdminService } from "../src/services/admin.service";
import { AppDataSource } from "../src/config/database";
import { auditService } from "../src/services/audit.service";
import { ApiError } from "../src/utils/ApiError";

jest.mock("../src/config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock("../src/services/audit.service", () => ({
  auditService: {
    log: jest.fn()
  }
}));

describe("AdminService", () => {
  let adminService: AdminService;
  let mockDeptRepo: any;

  beforeEach(() => {
    adminService = new AdminService();
    mockDeptRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn()
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockDeptRepo);
    jest.clearAllMocks();
  });

  describe("createDepartment", () => {
    it("should throw a 409 ApiError if department already exists", async () => {
      mockDeptRepo.findOne.mockResolvedValue({ id: 1, name: "Computer Science" });

      await expect(adminService.createDepartment({ name: "Computer Science" }))
        .rejects.toThrow(new ApiError(409, "A department with this name already exists."));
    });

    it("should create department and log audit on success", async () => {
      mockDeptRepo.findOne.mockResolvedValue(null);
      mockDeptRepo.create.mockReturnValue({ name: "Physics" });
      mockDeptRepo.save.mockResolvedValue({ id: 2, name: "Physics" });

      const result = await adminService.createDepartment({ name: "Physics" });

      expect(result).toEqual({ id: 2, name: "Physics" });
      expect(mockDeptRepo.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith("CREATE", "Department", "2", "Admin", { name: "Physics" });
    });
  });
});
