import { INotifable } from '@ts-core/notification';
import { INotificationProcessor } from './INotificationProcessor';
import { LoggerWrapper, ILogger } from '@ts-core/common/logger';
import { INotifableDetails } from '../NotificationServiceBase';

export abstract class NotificationHandler<U, V, T extends INotifable> extends LoggerWrapper implements INotificationProcessor<U, V, T> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _type: U;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, type: U) {
        super(logger);
        this._type = type;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract getNotifables(details: V): Promise<Array<INotifableDetails<T>>>;

    public abstract getChannels(notifable: T): Promise<Array<string>>;

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
