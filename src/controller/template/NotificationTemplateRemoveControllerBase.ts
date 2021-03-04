import { DefaultController } from '@ts-core/backend/controller';
import { ExtendedError } from '@ts-core/common/error';
import { Logger } from '@ts-core/common/logger';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import * as _ from 'lodash';

export class NotificationTemplateRemoveControllerBase extends DefaultController<number, void> {
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

    public async execute(id: number): Promise<void> {
        let item = await this.database.template.findOne({ id });
        if (_.isNil(item)) {
            throw new ExtendedError(`Can't find notification template with id "${id}"`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }
        await this.database.templateRemove(item.id);
    }
}
