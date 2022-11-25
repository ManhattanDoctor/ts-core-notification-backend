import { DefaultController, TypeormUtil } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { INotificationTemplate, INotificationTemplateListDto, INotificationTemplateListDtoResponse } from '@ts-core/notification';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { NotificationTemplateEntity } from '../../database/NotificationTemplateEntity';

export class NotificationTemplateListControllerBase extends DefaultController<INotificationTemplateListDto, INotificationTemplateListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected databse: NotificationDatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    public async execute(params: INotificationTemplateListDto): Promise<INotificationTemplateListDtoResponse> {
        let query = this.databse.template.createQueryBuilder();
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: NotificationTemplateEntity): Promise<INotificationTemplate> => item.toObject();
}
