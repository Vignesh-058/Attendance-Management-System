import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Course } from "./Course";
import { User } from "./User";

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  semester: string;

  @ManyToOne(() => Course, (course) => course.subjects)
  course: Course;

  @ManyToOne(() => User, { nullable: true })
  teacher: User; // Assigned teacher
}
