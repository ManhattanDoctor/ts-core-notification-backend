import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { INotificationTemplate } from '@ts-core/notification';
import { INotificationTemplateListDto, INotificationTemplateListDtoResponse } from '@ts-core/notification/dto/template';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
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
