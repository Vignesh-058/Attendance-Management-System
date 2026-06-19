import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./Role";
import { Department } from "./Department";
import { AttendanceRecord } from "./AttendanceRecord";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @ManyToOne(() => Department, (department) => department.users, { eager: true, nullable: true })
  department: Department;

  @Column({ nullable: true })
  semester: string;

  @Column({ nullable: true })
  section: string;

  @Column({ unique: true, nullable: true })
  rollNumber: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: "timestamp", nullable: true })
  lockedUntil: Date | null;

  @OneToMany(() => AttendanceRecord, (record) => record.student)
  attendanceRecords: AttendanceRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
