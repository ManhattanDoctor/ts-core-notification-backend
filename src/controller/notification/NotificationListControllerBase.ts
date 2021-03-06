import { DefaultController } from '@ts-core/backend/controller';
import { Logger } from '@ts-core/common/logger';
import { INotification } from '@ts-core/notification';
import { INotificationListDto, INotificationListDtoResponse } from '@ts-core/notification/dto/notification';
import { NotificationEntity } from '../../database/NotificationEntity';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';

export class NotificationListControllerBase extends DefaultController<INotificationListDto, INotificationListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected database: NotificationDatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    public async execute(params: INotificationListDto): Promise<INotificationListDtoResponse> {
        let query = this.database.notification.createQueryBuilder();
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: NotificationEntity): Promise<INotification> => item.toObject();
}
