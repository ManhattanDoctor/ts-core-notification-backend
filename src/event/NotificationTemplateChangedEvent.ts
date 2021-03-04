import { TransportEvent } from '@ts-core/common/transport';
import { INotificationTemplate } from '@ts-core/notification';

export class NotificationTemplateChangedEvent extends TransportEvent<INotificationTemplate> {
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

    constructor(data: INotificationTemplate) {
        super(NotificationTemplateChangedEvent.NAME, data);
    }
}
