import { INotifable, INotificationMessage, INotificationResult } from '@ts-core/notification';

export interface INotificationSender<U = string, V extends INotifable = INotifable> {
    readonly channel: string;
    send(notifable: V, message: INotificationMessage, type: U, details: any): Promise<INotificationResult>;
}
