import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Department } from "./Department";
import { Subject } from "./Subject";

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Department, { nullable: true })
  department: Department;

  @OneToMany(() => Subject, (subject) => subject.course)
  subjects: Subject[];
}
