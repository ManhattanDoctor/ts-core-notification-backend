import { INotifable } from '@ts-core/notification';
import { INotificationProcessor } from './INotificationProcessor';
import { LoggerWrapper, ILogger } from '@ts-core/common';
import { INotifableDetails } from '../NotificationServiceBase';
import * as _ from 'lodash';
import { NotificationDatabaseService } from '../NotificationDatabaseService';

export abstract class NotificationProcessorBase<U, V, T extends INotifable> extends LoggerWrapper implements INotificationProcessor<U, V, T> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected _type: U, protected database: NotificationDatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract getNotifables(details: V): Promise<Array<INotifableDetails<T>>>;

    public async getChannels(notifable: T): Promise<Array<string>> {
        let templates = await this.database.template.find({ type: this.type.toString() } as any);
        return _.uniq(templates.map(item => item.channel));
    }

    public async getTranslationDetails<T = any>(details: V): Promise<T> {
        return details as any;
    }

    public async isAvailable(notifable: T): Promise<boolean> {
        return true;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get type(): U {
        return this._type;
    }
}
