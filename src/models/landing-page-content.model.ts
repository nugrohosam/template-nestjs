import { LandingPageContentKeyEnum } from 'src/common/enums/landing-page-content.enum';
import { ILandingPageContent } from 'src/entities/landing-page-content.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'landing_page_contents' })
export class LandingPageContentModel implements ILandingPageContent {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'enum', enum: LandingPageContentKeyEnum })
    key: LandingPageContentKeyEnum;

    @Column('varchar')
    value: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
