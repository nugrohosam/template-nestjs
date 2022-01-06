import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class News {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    topic: string;
}
