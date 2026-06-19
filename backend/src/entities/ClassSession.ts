import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Subject } from "./Subject";
import { User } from "./User";

@Entity()
export class ClassSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => User)
  teacher: User;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "time" })
  startTime: string;

  @Column({ type: "time" })
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;
}
