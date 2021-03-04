import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import * as _ from 'lodash';
import { INotificationPreferenceEditDto, INotificationPreferenceEditDtoResponse, INotificationPreferenceItem } from '@ts-core/notification/dto/preference';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { INotifable, INotificationPreference, NotifableUid } from '@ts-core/notification';
import { NotificationServiceBase } from '../../NotificationServiceBase';
import { NotificationPreferenceEntity } from '../../database';
import { ExtendedError } from '@ts-core/common/error';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class NotificationPreferenceEditDto implements INotificationPreferenceEditDto {
    @ApiProperty()
    notifableUid: NotifableUid;

    @ApiProperty()
    @IsArray()
    items: Array<INotificationPreferenceItem>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class NotificationPreferenceEditControllerBase<U extends INotifable> extends DefaultController<
    INotificationPreferenceEditDto,
    INotificationPreferenceEditDtoResponse
> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected database: NotificationDatabaseService, protected service: NotificationServiceBase<U>) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    protected async edit(notifable: U, params: INotificationPreferenceEditDto): Promise<INotificationPreferenceEditDtoResponse> {
        let types = await this.service.getTypesAllowed(notifable);
        if (params.items.some(item => !types.includes(item.type))) {
            throw new ExtendedError(`Some of notification types are not allowed`, ExtendedError.HTTP_CODE_BAD_REQUEST);
        }

        let exists = await this.database.preference
            .createQueryBuilder()
            .where({ notifableUid: notifable.notifableUid })
            .getMany();

        let items = Array();
        for (let item of params.items) {
            let exist = _.find(exists, { type: item.type });
            let isExist = !_.isNil(exist);

            if (_.isEmpty(item.channels)) {
                if (isExist) {
                    this.log(`"${item.type}" removed`);
                    await this.database.preferenceRemove(exist.id);
                }
                continue;
            }

            let channelsAllowed = await this.service.getChannelsAllowed(item.type, notifable);
            if (item.channels.some(item => !channelsAllowed.includes(item))) {
                throw new ExtendedError(`Notification type "${item.type}" contains not allowed channels`, ExtendedError.HTTP_CODE_BAD_REQUEST);
            }

            if (!isExist) {
                this.log(`"${item.type}" created`);
                exist = new NotificationPreferenceEntity();
                exist.type = item.type.toString();
                exist.notifableUid = notifable.notifableUid;
            }
            exist.channels = item.channels;

            await this.database.preferenceSave(exist);
            items.push(exist);
        }

        return items.map(this.transform);
    }
    
    protected transform = (item: NotificationPreferenceEntity): INotificationPreference => item.toObject();
}
