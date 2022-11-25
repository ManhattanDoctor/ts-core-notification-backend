import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { INotificationsSettingsDto, INotificationsSettingsDtoResponse } from '@ts-core/notification';
import { NotificationServiceBase } from '../NotificationServiceBase';

export class NotificationSettingsControllerBase extends DefaultController<INotificationsSettingsDto, INotificationsSettingsDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected service: NotificationServiceBase) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    public async execute(params: INotificationsSettingsDto): Promise<INotificationsSettingsDtoResponse> {
        return {
            types: await this.service.getTypesAll(),
            locales: await this.service.getLocalesAll(),
            channels: await this.service.getChannelsAll()
        };
    }
}
