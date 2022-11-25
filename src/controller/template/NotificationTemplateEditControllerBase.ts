import { DefaultController } from '@ts-core/backend';
import { ObjectUtil, ExtendedError, Logger } from '@ts-core/common';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import { INotificationTemplateEditDto, INotificationTemplateEditDtoResponse } from '@ts-core/notification';
import * as _ from 'lodash';

export class NotificationTemplateEditControllerBase extends DefaultController<INotificationTemplateEditDto, INotificationTemplateEditDtoResponse> {
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

    public async execute(params: INotificationTemplateEditDto): Promise<INotificationTemplateEditDtoResponse> {
        let item = await this.database.template.findOne({ id: params.id } as any);
        if (_.isNil(item)) {
            throw new ExtendedError(`Can't find notification template with id "${params.id}"`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }

        ObjectUtil.copyPartial(params, item, null, ['id']);
        await this.database.template.save(item);
        return item.toObject();
    }
}
