import { DefaultController } from '@ts-core/backend/controller';
import { Logger } from '@ts-core/common/logger';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import * as _ from 'lodash';
import { INotificationTemplateAddDto, INotificationTemplateAddDtoResponse } from '@ts-core/notification/dto/template';
import { ObjectUtil } from '@ts-core/common/util';
import { NotificationTemplateEntity } from '../../database/NotificationTemplateEntity';

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

        await this.database.templateSave(item);
        return item.toObject();
    }
}
