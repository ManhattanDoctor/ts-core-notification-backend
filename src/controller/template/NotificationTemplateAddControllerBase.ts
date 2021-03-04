import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import * as _ from 'lodash';
import { INotificationTemplateAddDto, INotificationTemplateAddDtoResponse } from '@ts-core/notification/dto/template';
import { ObjectUtil } from '@ts-core/common/util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { NotificationTemplateEntity } from '../../database';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class NotificationTemplateAddDto implements INotificationTemplateAddDto {
    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    locale: string;

    @ApiProperty()
    @IsString()
    channel: string;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subject?: string;

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

export class NotificationTemplateAddControllerBase extends DefaultController<INotificationTemplateAddDto, INotificationTemplateAddDtoResponse> {
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

    public async execute(params: INotificationTemplateAddDto): Promise<INotificationTemplateAddDtoResponse> {
        let item = new NotificationTemplateEntity();
        ObjectUtil.copyPartial(params, item);

        await this.database.templateSave(item);
        return item.toObject();
    }
}
