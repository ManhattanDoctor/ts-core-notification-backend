import { TransportEvent } from '@ts-core/common';
import { INotificationTemplate } from '@ts-core/notification';

export class NotificationTemplateChangedEvent<U = string> extends TransportEvent<INotificationTemplate<U>> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'NotificationTemplateChangedEvent';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: INotificationTemplate<U>) {
        super(NotificationTemplateChangedEvent.NAME, data);
    }
}
