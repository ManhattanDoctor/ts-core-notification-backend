import { TransformUtil } from '@ts-core/common/util';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Index, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { INotificationPreference, NotifableUid } from '@ts-core/notification';
import * as _ from 'lodash';

@Entity({ name: 'notification_preference_entity' })
@Index(['type', 'notifableUid'], { unique: true })
export class NotificationPreferenceEntity implements INotificationPreference {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column({ type: 'varchar' })
    @IsString()
    public type: string;

    @Column({ name: 'notifable_uid', type: 'integer' })
    @IsNumber()
    public notifableUid: NotifableUid;

    @Column({ type: 'varchar', array: true })
    @IsString({ each: true })
    public channels: Array<string>;

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

    public toObject(): INotificationPreference {
        return TransformUtil.fromClass(this, { excludePrefixes: ['__'] });
    }
}
