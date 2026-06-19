import { AppDataSource } from "../config/database";
import { AuditLog } from "../entities/AuditLog";

export class AuditService {
  async log(action: string, entityType: string, entityId: string | null, performedBy: string | null, details: any = null) {
    try {
      const auditRepo = AppDataSource.getRepository(AuditLog);
      const newLog = new AuditLog();
      newLog.action = action;
      newLog.entityType = entityType;
      newLog.entityId = entityId as any;
      newLog.performedBy = performedBy as any;
      newLog.details = details;

      await auditRepo.save(newLog);
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }
}

export const auditService = new AuditService();
