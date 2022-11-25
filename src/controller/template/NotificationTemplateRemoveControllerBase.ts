import { DefaultController } from '@ts-core/backend';
import { Logger, ExtendedError } from '@ts-core/common';
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
        let item = await this.database.template.findOne({ id } as any);
        if (_.isNil(item)) {
            throw new ExtendedError(`Can't find notification template with id "${id}"`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }
        await this.database.template.delete({ id: item.id });
    }
}
