import { Index, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNumber, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import * as _ from 'lodash';
import { INotificationTemplate } from '@ts-core/notification';
import { TransformUtil } from '@ts-core/common/util';

@Entity({ name: 'notification_template' })
@Index(['type', 'locale', 'channel'], { unique: true })
export class NotificationTemplateEntity implements INotificationTemplate {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @IsString()
    public type: string;

    @Column()
    @IsString()
    public locale: string;

    @Column()
    @IsString()
    public channel: string;

    @Column()
    @IsString()
    public text: string;

    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    public subject?: string;

    @CreateDateColumn({ name: 'created_date' })
    @Type(() => Date)
    public createdDate: Date;

    @UpdateDateColumn({ name: 'updated_date' })
    @Type(() => Date)
    public updatedDate: Date;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(): INotificationTemplate {
        return TransformUtil.fromClass(this, { excludePrefixes: ['__'] });
    }
}
