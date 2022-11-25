import { ILogger, LoggerWrapper } from '@ts-core/common';
import { INotifable, INotificationTemplate, INotificationMessage } from '@ts-core/notification';
import { NotificationDatabaseService } from './NotificationDatabaseService';
import { NotificationLocaleService } from './NotificationLocaleService';
import { INotificationProcessor } from './processor';
import { INotificationSender } from './sender';
import * as _ from 'lodash';

export abstract class NotificationServiceBase<U = string, T extends INotifable = INotifable> extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _senders: Array<INotificationSender<U, T>>;
    protected templates: Map<string, INotificationTemplate>;
    protected processors: Map<U, INotificationProcessor<U, any, T>>;
    protected defaultLocale: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected database: NotificationDatabaseService, protected locale: NotificationLocaleService) {
        super(logger);
        this._senders = new Array();

        this.templates = new Map();
        this.processors = new Map();
        this.defaultLocale = 'en';
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

        let item = await this.database.template.findOne({ type: type.toString(), locale, channel } as any);
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

    protected abstract send(type: U, details: any, notifable: T, senders: INotificationSender<U, T>, message: INotificationMessage): Promise<void>;

    protected async getLocale(notifable: T): Promise<string> {
        return this.defaultLocale;
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

    protected async getSenders(channel: string): Promise<Array<INotificationSender<U, T>>> {
        return _.filter(this.senders, item => item.channel === channel);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract getTypesAll(): Promise<Array<U>>;

    public abstract getLocalesAll(): Promise<Array<string>>;

    public abstract getChannelsAll(): Promise<Array<string>>;

    public async getAvailableTypes(notifable: T): Promise<Array<U>> {
        let items = [];
        for (let item of this.processors.values()) {
            if (await item.isAvailable(notifable)) {
                items.push(item.type);
            }
        }
        return items;
    }

    public async getAvailableChannels(type: U, notifable: T): Promise<Array<string>> {
        let processor = this.processors.get(type);
        return !_.isNil(processor) ? processor.getChannels(notifable) : [];
    }

    public async notify(type: U, details: any): Promise<void> {
        let processor = this.processors.get(type);
        if (_.isNil(processor)) {
            this.warn(`Unable to notify "${type}": can't find processor`);
            return;
        }

        for (let item of await processor.getNotifables(details)) {
            let template = await this.getTemplate(type, await this.getLocale(item.notifable), item.channel);
            if (_.isNil(template)) {
                this.warn(`Unable to notify "${item.notifable.notifableUid}" of ${type} via "${item.channel}": template is Nil`);
                continue;
            }

            let message = await this.createMessage(type, details, template);
            for (let sender of await this.getSenders(item.channel)) {
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

        this.processors.forEach(item => item.destroy());
        this.processors.clear();
        this.processors = null;

        this._senders = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get senders(): Array<INotificationSender<U, T>> {
        return this._senders;
    }
}

export interface INotifableDetails<T extends INotifable> {
    channel: string;
    notifable: T;
}
