import { DefaultController } from '@ts-core/backend/controller';
import { Logger } from '@ts-core/common/logger';
import { INotifable } from '@ts-core/notification';
import { INotificationPreferenceListDto, INotificationPreferenceListDtoResponse } from '@ts-core/notification/dto/preference';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { NotificationServiceBase } from '../../NotificationServiceBase';
import * as _ from 'lodash';

export class NotificationPreferenceListControllerBase<U extends INotifable> extends DefaultController<
    INotificationPreferenceListDto,
    INotificationPreferenceListDtoResponse
> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected database: NotificationDatabaseService, protected service: NotificationServiceBase<U>) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async list(notifable: U, params: INotificationPreferenceListDto): Promise<INotificationPreferenceListDtoResponse> {
        let types = await this.service.getAvailableTypes(notifable);
        let exists = await this.database.preference
            .createQueryBuilder()
            .where({ notifableUid: notifable.notifableUid })
            .getMany();

        let items = new Array();
        for (let type of types) {
            let exist = _.find(exists, item => type.toString() === item.type);
            let isExist = !_.isNil(exist);

            let channels = new Array();
            let channelsAvailable = await this.service.getAvailableChannels(type, notifable);
            if (isExist) {
                channels = exist.channels.filter(item => channelsAvailable.includes(item));
            }
            items.push({ type, channels, channelsAvailable });
        }
        return items;
    }
}
