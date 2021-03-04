import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { ExtendedError } from '@ts-core/common/error';
import { Logger } from '@ts-core/common/logger';
import { NotificationDatabaseService } from '../../NotificationDatabaseService';
import * as _ from 'lodash';
import { INotificationTemplateEditDto, INotificationTemplateEditDtoResponse } from '@ts-core/notification/dto/template';
import { ObjectUtil } from '@ts-core/common/util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class NotificationTemplateEditDto implements INotificationTemplateEditDto {
    @ApiProperty()
    @IsNumber()
    id: number;

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

export class NotificationTemplateEditControllerBase extends DefaultController<INotificationTemplateEditDto, INotificationTemplateEditDtoResponse> {
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

    public async execute(params: INotificationTemplateEditDto): Promise<INotificationTemplateEditDtoResponse> {
        let item = await this.database.template.findOne({ id: params.id });
        if (_.isNil(item)) {
            throw new ExtendedError(`Can't find notification template with id "${params.id}"`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }

        ObjectUtil.copyPartial(params, item, null, ['id']);
        await this.database.templateSave(item);
        return item.toObject();
    }
}
