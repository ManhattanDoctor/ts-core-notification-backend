import { TransportEvent } from '@ts-core/common';
import { NotifableUid } from '@ts-core/notification';

export class NotificationPersonallyEvent<U, V extends INotificationPersonallyDto = INotificationPersonallyDto> extends TransportEvent<V> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(type: U, data: V) {
        super(type.toString(), data);
    }
}

export interface INotificationPersonallyDto {
    notifableUid: NotifableUid | Array<NotifableUid>;
    channels?: Array<string>;
}
