import { DefaultController } from '@ts-core/backend';
import { Logger, ObjectUtil } from '@ts-core/common';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { INotificationTemplateAddDto, INotificationTemplateAddDtoResponse } from '@ts-core/notification';
import { NotificationTemplateEntity } from '../../database/NotificationTemplateEntity';
import * as _ from 'lodash';

export class NotificationTemplateAddControllerBase extends DefaultController<INotificationTemplateAddDto, INotificationTemplateAddDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: NotificationDatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async execute(params: INotificationTemplateAddDto): Promise<INotificationTemplateAddDtoResponse> {
        let item = new NotificationTemplateEntity();
        ObjectUtil.copyPartial(params, item);

        await this.database.template.save(item);
        return item.toObject();
    }
}
