import { INotificationMessage, INotificationTemplate } from '@ts-core/notification';
import { ExtendedError } from '@ts-core/common/error';
import { DestroyableMapCollection } from '@ts-core/common/map';
import { LanguageLocale } from '@ts-core/language';
import * as _ from 'lodash';

export class NotificationLocaleService extends DestroyableMapCollection<LanguageLocale> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super('locale');
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async translate(template: INotificationTemplate, details?: any): Promise<INotificationMessage> {
        if (_.isNil(this.has(template.locale))) {
            throw new ExtendedError(`Unable to translate message for "${template.type}" notification: locale "${template.locale}}" is Nil`);
        }
        let locale = this.get(template.locale);
        let text = locale.compile(template.text, details);
        return !_.isNil(template.subject) ? { text, subject: locale.compile(template.subject, details) } : { text };
    }
}
