import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import * as _ from 'lodash';
import { TransformUtil } from '@ts-core/common/util';
import { INotification, INotificationMessage, NotificationStatus } from '@ts-core/notification';
import { INotificationSenderResult } from '@ts-core/notification';

@Entity({ name: 'notification' })
export class NotificationEntity implements INotification {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(
        type: string,
        channel: string,
        notifableUid: number,
        message: INotificationMessage,
        result: INotificationSenderResult
    ): NotificationEntity {
        let item = new NotificationEntity();
        item.type = type;
        item.status = result.status;
        item.channel = channel;
        item.message = message;
        item.details = result.details;
        item.notifableUid = notifableUid;
        return item;
    }

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

    @Column({ type: 'varchar' })
    @IsEnum(NotificationStatus)
    public status: NotificationStatus;

    @Column({ type: 'varchar' })
    @IsString()
    public channel: string;

    @Column({ name: 'notifable_uid', type: 'integer' })
    @IsNumber()
    public notifableUid: number;

    @Column({ nullable: true, type: 'json' })
    @IsOptional()
    public message?: INotificationMessage;

    @Column({ nullable: true, type: 'json' })
    @IsOptional()
    public details?: any;

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

    public toObject(): INotification {
        return TransformUtil.fromClass(this, { excludePrefixes: ['__'] });
    }
}
