import { NotificationEntity, NotificationTemplateEntity } from './database';
import { Connection, DeleteResult, Repository } from 'typeorm';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { NotificationPreferenceEntity } from './database';

export class NotificationDatabaseService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected connection: Connection) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async notificationSave(item: NotificationEntity): Promise<NotificationEntity> {
        await TypeormUtil.validateEntity(item);
        return this.notification.save(item);
    }

    public async notificationRemove(id: number): Promise<DeleteResult> {
        return this.notification.delete({ id });
    }

    public async templateSave(item: NotificationTemplateEntity): Promise<NotificationTemplateEntity> {
        await TypeormUtil.validateEntity(item);
        return this.template.save(item);
    }

    public async templateRemove(id: number): Promise<DeleteResult> {
        return this.template.delete({ id });
    }

    public async preferenceSave(item: NotificationPreferenceEntity): Promise<NotificationPreferenceEntity> {
        await TypeormUtil.validateEntity(item);
        return this.preference.save(item);
    }

    public async preferenceRemove(id: number): Promise<DeleteResult> {
        return this.preference.delete({ id });
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get notification(): Repository<NotificationEntity> {
        return this.connection.getRepository(NotificationEntity);
    }

    public get template(): Repository<NotificationTemplateEntity> {
        return this.connection.getRepository(NotificationTemplateEntity);
    }

    public get preference(): Repository<NotificationPreferenceEntity> {
        return this.connection.getRepository(NotificationPreferenceEntity);
    }
}
