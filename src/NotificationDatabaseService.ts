import { NotificationEntity, NotificationPreferenceEntity, NotificationTemplateEntity } from './database';
import { Connection, Repository } from 'typeorm';
import { ILogger, LoggerWrapper } from '@ts-core/common';

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
