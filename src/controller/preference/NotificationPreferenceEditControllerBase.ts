import { DefaultController } from '@ts-core/backend/controller';
import { Logger } from '@ts-core/common/logger';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { INotificationPreferenceEditDto, INotificationPreferenceEditDtoResponse } from '@ts-core/notification/dto/preference';
import { INotifable, INotificationPreference } from '@ts-core/notification';
import { NotificationServiceBase } from '../../NotificationServiceBase';
import { NotificationPreferenceEntity } from '../../database/NotificationPreferenceEntity';
import { ExtendedError } from '@ts-core/common/error';
import * as _ from 'lodash';

export class NotificationPreferenceEditControllerBase<U = string, V extends INotifable = INotifable> extends DefaultController<
    INotificationPreferenceEditDto,
    INotificationPreferenceEditDtoResponse
> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected database: NotificationDatabaseService, protected service: NotificationServiceBase<U, V>) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    protected async edit(notifable: V, params: INotificationPreferenceEditDto<U>): Promise<INotificationPreferenceEditDtoResponse> {
        let types = await this.service.getAvailableTypes(notifable);
        if (params.items.some(item => !types.includes(item.type))) {
            throw new ExtendedError(`Some of notification types are not available`, ExtendedError.HTTP_CODE_BAD_REQUEST);
        }

        let exists = await this.database.preference
            .createQueryBuilder()
            .where({ notifableUid: notifable.notifableUid })
            .getMany();

        let items = Array();
        for (let item of params.items) {
            let exist = _.find(exists, value => item.type.toString() === value.type);
            let isExist = !_.isNil(exist);

            if (_.isEmpty(item.channels)) {
                if (isExist) {
                    await this.database.preferenceRemove(exist.id);
                }
                continue;
            }

            let channelsAvailable = await this.service.getAvailableChannels(item.type, notifable);
            if (item.channels.some(item => !channelsAvailable.includes(item))) {
                throw new ExtendedError(`Notification type "${item.type}" contains not available channels`, ExtendedError.HTTP_CODE_BAD_REQUEST);
            }

            if (!isExist) {
                exist = new NotificationPreferenceEntity();
                exist.type = item.type.toString();
                exist.notifableUid = notifable.notifableUid;
            }
            exist.channels = item.channels;

            await this.database.preferenceSave(exist);
            items.push(exist);
        }

        return items.map(this.transform);
    }

    protected transform = (item: NotificationPreferenceEntity): INotificationPreference => item.toObject();
}
