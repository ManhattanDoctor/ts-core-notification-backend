import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { INotifable, INotificationSender, INotificationTemplate, INotificationMessage } from '@ts-core/notification';
import { NotificationDatabaseService } from './NotificationDatabaseService';
import { NotificationLocaleService } from './NotificationLocaleService';
import { INotificationProcessor } from './processor';

export abstract class NotificationServiceBase<U = string, T extends INotifable = INotifable> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _senders: Array<INotificationSender<T>>;
    protected templates: Map<string, INotificationTemplate>;
    protected processors: Map<U, INotificationProcessor<U, any, T>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected database: NotificationDatabaseService, protected locale: NotificationLocaleService) {
        super(logger);
        this._senders = new Array();
        this.templates = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Template Methods
    //
    // --------------------------------------------------------------------------

    protected async getTemplate(type: U, locale: string, channel: string): Promise<INotificationTemplate> {
        let key = this.getTemplateCacheKey(type, channel, locale);
        if (this.templates.has(key)) {
            return this.templates.get(key);
        }

        let item = await this.database.template.findOne({ type: type.toString(), locale, channel });
        if (!_.isNil(item)) {
            this.templates.set(key, item.toObject());
        }
        return this.templates.get(key);
    }

    protected getTemplateCacheKey(type: U, channel: string, locale: string): string {
        return `${type.toString()}_${channel}_${locale}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------}

    protected abstract getNotifableLocale(notifable: T): Promise<string>;

    protected abstract send(type: U, details: any, notifable: T, senders: INotificationSender<T>, message: INotificationMessage): Promise<void>;

    protected getSenders(channel: string): Array<INotificationSender<T>> {
        return _.filter(this.senders, item => item.channel === channel);
    }

    protected async createMessage(type: U, details: any, template: INotificationTemplate): Promise<INotificationMessage> {
        let processor = this.processors.get(type);
        if (!_.isNil(processor)) {
            details = await processor.getTranslationDetails(details);
        }

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

    public abstract getAvailableTypes(notifable: T): Promise<Array<U>>;

    public abstract getAvailableChannels(type: U, notifable: T): Promise<Array<string>>;

    public async notify(type: U, details: any): Promise<void> {
        let processor = this.processors.get(type);
        if (_.isNil(processor)) {
            this.warn(`Unable to notify "${type}": can't find processor`);
            return;
        }

        for (let item of await processor.getNotifables(details)) {
            let template = await this.getTemplate(type, await this.getNotifableLocale(details.notifable), item.channel);
            if (_.isNil(template)) {
                this.warn(`Unable to notify "${item.notifable.notifableUid}" of ${type} via "${item.channel}": template is Nil`);
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

        this._senders = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get senders(): Array<INotificationSender<T>> {
        return this._senders;
    }
}

export interface INotifableDetails<T extends INotifable> {
    channel: string;
    notifable: T;
}
