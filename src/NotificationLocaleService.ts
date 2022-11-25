import { INotificationMessage, INotificationTemplate } from '@ts-core/notification';
import { DestroyableMapCollection, ExtendedError } from '@ts-core/common';
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
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected translateText<T>(text: string, locale: LanguageLocale, details?: T): string {
        return locale.compile(text, details);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async translate<T>(template: INotificationTemplate, details?: T): Promise<INotificationMessage> {
        if (_.isNil(this.has(template.locale))) {
            throw new ExtendedError(`Unable to translate message for "${template.type}" notification: locale "${template.locale}}" is Nil`);
        }
        let locale = this.get(template.locale);
        let text = this.translateText(template.text, locale, details);
        return !_.isNil(template.subject) ? { text, subject: this.translateText(template.subject, locale, details) } : { text };
    }
}
