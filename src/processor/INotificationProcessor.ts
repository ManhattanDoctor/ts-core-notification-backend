import { IDestroyable } from '@ts-core/common';
import { INotifable } from '@ts-core/notification';
import { INotifableDetails } from '../NotificationServiceBase';

export interface INotificationProcessor<U, V, T extends INotifable> extends IDestroyable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    readonly type: U;

    getNotifables(details: V): Promise<Array<INotifableDetails<T>>>;

    getTranslationDetails<T = any>(details: V): Promise<T>;

    isAvailable(notifable: T): Promise<boolean>;

    getChannels(notifable: T): Promise<Array<string>>;
}
