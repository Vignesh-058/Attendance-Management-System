import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  token: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
