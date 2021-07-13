import { TransportEvent } from '@ts-core/common/transport';

export class NotificationEvent<U, V> extends TransportEvent<V> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(type: U, data?: V) {
        super(type.toString(), data);
    }
}
