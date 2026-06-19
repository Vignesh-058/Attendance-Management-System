import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";
import { ClassSession } from "./ClassSession";

@Entity()
@Index(["student", "classSession"], { unique: true })
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.attendanceRecords)
  student: User;

  @ManyToOne(() => ClassSession)
  classSession: ClassSession;

  @Column({ type: "varchar", length: 20, default: "Absent" })
  status: string; // Present, Absent, Leave

  @CreateDateColumn()
  createdAt: Date;
}
