import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { INotifable, INotificationSender, INotificationTemplate, INotificationMessage } from '@ts-core/notification';
import { NotificationDatabaseService } from './NotificationDatabaseService';
import { NotificationLocaleService } from './NotificationLocaleService';

export abstract class NotificationServiceBase<U extends INotifable> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected senders: Array<INotificationSender<U>>;
    protected templates: Map<string, INotificationTemplate>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected database: NotificationDatabaseService, protected locale: NotificationLocaleService) {
        super(logger);
        this.senders = new Array();
        this.templates = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Template Methods
    //
    // --------------------------------------------------------------------------

    protected async getTemplate(type: string, details: INotifableDetails<U>): Promise<INotificationTemplate> {
        let locale = await this.getNotifableLocale(details.notifable);
        let key = this.getTemplateCacheKey(type, details.channel, locale);
        if (this.templates.has(key)) {
            return this.templates.get(key);
        }

        let item = await this.database.template.findOne({ type, locale, channel: details.channel });
        if (!_.isNil(item)) {
            this.templates.set(key, item.toObject());
        }
        return this.templates.get(key);
    }

    protected getTemplateCacheKey(type: string, channel: string, locale: string): string {
        return `${type}_${channel}_${locale}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected abstract getNotifables(type: string, details: any): Promise<Array<INotifableDetails<U>>>;

    protected abstract getNotifableLocale(notifable: U): Promise<string>;

    protected abstract send(type: string, details: any, notifable: U, senders: INotificationSender<U>, message: INotificationMessage): Promise<void>;

    protected getSenders(channel: string): Array<INotificationSender<U>> {
        return _.filter(this.senders, item => item.channel === channel);
    }

    protected async createMessage(type: string, details: any, template: INotificationTemplate): Promise<INotificationMessage> {
        try {
            return this.locale.translate(template, details);
        } catch (error) {
            this.warn(error.message);
            return !_.isEmpty(template.subject) ? { text: template.text, subject: template.subject } : { text: template.text };
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract getTypesAllowed(notifable: U): Promise<Array<string>>;

    public abstract getChannelsAllowed(type: string, notifable: U): Promise<Array<string>>;

    public async notify(type: string, details: any): Promise<void> {
        let notifables = await this.getNotifables(type, details);
        if (_.isEmpty(notifables)) {
            return;
        }

        for (let item of notifables) {
            let template = await this.getTemplate(type, item);
            if (_.isNil(template)) {
                this.warn(`Unable to notify "${item.notifable.notifableUid}" of ${type}: template is Nil`);
                continue;
            }

            let message = await this.createMessage(type, details, template);
            for (let sender of this.getSenders(item.channel)) {
                this.send(type, details, item.notifable, sender, message);
            }
        }
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();

        this.templates.clear();
        this.templates = null;

        this.senders = null;
    }
}

export interface INotifableDetails<T extends INotifable> {
    channel: string;
    notifable: T;
}
