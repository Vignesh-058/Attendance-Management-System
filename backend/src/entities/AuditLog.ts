import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  performedBy: string; // User ID or Email

  @Column({ type: "json", nullable: true })
  details: any;

  @CreateDateColumn()
  timestamp: Date;
}
