import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import * as _ from 'lodash';
import { TransformUtil, ValidateUtil } from '@ts-core/common';
import { INotification, INotificationMessage, NotifableUid, NotificationStatus } from '@ts-core/notification';
import { INotificationResult } from '@ts-core/notification';

@Entity({ name: 'notification' })
export class NotificationEntity<U = string, V = any> implements INotification {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(
        type: string,
        channel: string,
        notifableUid: NotifableUid,
        message: INotificationMessage,
        result: INotificationResult
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
    public notifableUid: NotifableUid;

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

    @BeforeUpdate()
    @BeforeInsert()
    public validate(): void {
        ValidateUtil.validate(this);
    }
}
