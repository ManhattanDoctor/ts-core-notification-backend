# @ts-core/notification-backend

Серверная TypeScript библиотека для систем уведомлений. Предоставляет сущности базы данных, сервисы, контроллеры и процессоры для управления уведомлениями, шаблонами и пользовательскими настройками.

## Содержание

- [Установка](#установка)
- [Зависимости](#зависимости)
- [Архитектура](#архитектура)
- [Основные сервисы](#основные-сервисы)
- [Сущности базы данных](#сущности-базы-данных)
- [Контроллеры](#контроллеры)
- [Процессоры уведомлений](#процессоры-уведомлений)
- [Транспортные события](#транспортные-события)
- [Полный пример настройки](#полный-пример-настройки)
- [Связанные пакеты](#связанные-пакеты)

## Установка

```bash
npm install @ts-core/notification-backend
```

```bash
yarn add @ts-core/notification-backend
```

```bash
pnpm add @ts-core/notification-backend
```

## Зависимости

| Пакет | Описание |
|-------|----------|
| `@ts-core/backend` | Серверные утилиты |
| `@ts-core/common` | Базовые классы и интерфейсы |
| `@ts-core/language` | Поддержка локализации |
| `@ts-core/notification` | Общие интерфейсы уведомлений |
| `typeorm` | ORM для работы с базой данных |

## Архитектура

```
@ts-core/notification-backend
├── NotificationServiceBase       # Основной сервис отправки
├── NotificationDatabaseService   # Работа с БД
├── NotificationLocaleService     # Локализация
├── database/
│   ├── NotificationEntity
│   ├── NotificationTemplateEntity
│   └── NotificationPreferenceEntity
├── controller/
│   ├── NotificationListControllerBase
│   ├── NotificationPreference*ControllerBase
│   └── NotificationTemplate*ControllerBase
├── processor/
│   └── NotificationProcessorBase
└── sender/
    └── INotificationSender
```

## Основные сервисы

### NotificationServiceBase

Базовый сервис для отправки уведомлений:

```typescript
import { NotificationServiceBase } from '@ts-core/notification-backend';

class NotificationService extends NotificationServiceBase {
    constructor(
        logger: ILogger,
        database: NotificationDatabaseService,
        senders: Map<string, INotificationSender>
    ) {
        super(logger, database, senders);
    }

    async send(message: INotificationMessage): Promise<INotificationResult> {
        // Проверка настроек пользователя
        const canSend = await this.checkPreference(message);
        if (!canSend) {
            return { success: false, reason: 'disabled_by_user' };
        }

        // Получение шаблона
        const template = await this.getTemplate(message);

        // Рендеринг и отправка
        return this.sendWithTemplate(message, template);
    }
}
```

### NotificationDatabaseService

Сервис для операций с базой данных:

```typescript
import { NotificationDatabaseService } from '@ts-core/notification-backend';

class MyDatabaseService extends NotificationDatabaseService {
    // Доступ к репозиториям
    get notifications() { return this.notificationRepository; }
    get templates() { return this.templateRepository; }
    get preferences() { return this.preferenceRepository; }

    // Получение настройки пользователя
    async getPreference(userId: number, type: string, channel: string) {
        return this.preferences.findOne({ userId, type, channel });
    }

    // Получение шаблона
    async getTemplate(type: string, channel: string, locale: string) {
        return this.templates.findOne({ type, channel, locale });
    }
}
```

### NotificationLocaleService

Сервис локализации уведомлений:

```typescript
import { NotificationLocaleService } from '@ts-core/notification-backend';

const localeService = new NotificationLocaleService(languageService);

// Рендеринг шаблона с учётом локали
const content = await localeService.render(template, data, 'ru');
// Переменные {{userName}} заменяются на значения из data
```

## Сущности базы данных

### NotificationEntity

Сущность уведомления:

```typescript
import { NotificationEntity } from '@ts-core/notification-backend';

@Entity({ name: 'notification' })
class NotificationEntity implements INotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;           // Тип уведомления

    @Column()
    channel: string;        // Канал (email, push, sms)

    @Column()
    recipient: string;      // Получатель

    @Column()
    status: NotificationStatus;  // Статус

    @Column({ type: 'jsonb', nullable: true })
    data: any;              // Данные уведомления

    @CreateDateColumn({ name: 'created_date' })
    createdDate: Date;

    @Column({ name: 'sent_date', nullable: true })
    sentDate: Date;
}
```

### NotificationTemplateEntity

Сущность шаблона:

```typescript
import { NotificationTemplateEntity } from '@ts-core/notification-backend';

@Entity({ name: 'notification_template' })
@Index(['type', 'channel', 'locale'], { unique: true })
class NotificationTemplateEntity implements INotificationTemplate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;           // Тип уведомления

    @Column()
    channel: string;        // Канал

    @Column()
    locale: string;         // Язык (ru, en, etc.)

    @Column({ nullable: true })
    subject: string;        // Тема (для email)

    @Column({ type: 'text' })
    content: string;        // Содержимое шаблона
}
```

### NotificationPreferenceEntity

Сущность настроек пользователя:

```typescript
import { NotificationPreferenceEntity } from '@ts-core/notification-backend';

@Entity({ name: 'notification_preference' })
@Index(['userId', 'type', 'channel'], { unique: true })
class NotificationPreferenceEntity implements INotificationPreference {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;         // ID пользователя

    @Column()
    type: string;           // Тип уведомления

    @Column()
    channel: string;        // Канал

    @Column({ name: 'is_enabled', default: true })
    isEnabled: boolean;     // Включено ли
}
```

## Контроллеры

### Контроллер списка уведомлений

```typescript
import { NotificationListControllerBase } from '@ts-core/notification-backend';

@Controller('notifications')
class NotificationController extends NotificationListControllerBase {
    constructor(database: NotificationDatabaseService) {
        super(database);
    }

    @Get()
    async list(@Query() dto: NotificationListDto) {
        return super.list(dto);
    }
}
```

### Контроллеры настроек

```typescript
import {
    NotificationPreferenceListControllerBase,
    NotificationPreferenceEditControllerBase
} from '@ts-core/notification-backend';

@Controller('notification-preferences')
class PreferenceController {
    constructor(private database: NotificationDatabaseService) {}

    @Get()
    async list(@Query() dto, @User() user) {
        return this.database.preferences.find({ userId: user.id });
    }

    @Put(':id')
    async edit(@Param('id') id: number, @Body() dto: { isEnabled: boolean }) {
        return this.database.preferences.update(id, dto);
    }
}
```

### Контроллеры шаблонов

```typescript
import {
    NotificationTemplateAddControllerBase,
    NotificationTemplateEditControllerBase,
    NotificationTemplateListControllerBase,
    NotificationTemplateRemoveControllerBase
} from '@ts-core/notification-backend';

@Controller('notification-templates')
class TemplateController extends NotificationTemplateListControllerBase {
    @Get()
    list(@Query() dto) { return super.list(dto); }

    @Post()
    add(@Body() dto: INotificationTemplateAddDto) { return super.add(dto); }

    @Put(':id')
    edit(@Param('id') id: number, @Body() dto) { return super.edit(id, dto); }

    @Delete(':id')
    remove(@Param('id') id: number) { return super.remove(id); }
}
```

## Процессоры уведомлений

### NotificationProcessorBase

Базовый класс для процессоров каналов:

```typescript
import { NotificationProcessorBase, INotificationProcessor } from '@ts-core/notification-backend';

class EmailProcessor extends NotificationProcessorBase implements INotificationProcessor {
    readonly channel = 'email';

    constructor(
        private emailService: EmailService,
        private database: NotificationDatabaseService
    ) {
        super();
    }

    async process(notification: NotificationEntity): Promise<void> {
        // Получение шаблона
        const template = await this.getTemplate(notification);

        // Рендеринг контента
        const content = await this.render(template, notification.data);

        // Отправка
        await this.emailService.send({
            to: notification.recipient,
            subject: content.subject,
            html: content.body
        });

        // Обновление статуса
        await this.markAsSent(notification);
    }
}
```

### Интерфейс отправителя

```typescript
import { INotificationSender } from '@ts-core/notification-backend';

class EmailSender implements INotificationSender {
    readonly channel = 'email';

    async send(notification: INotification, content: string): Promise<boolean> {
        try {
            await this.mailer.send({
                to: notification.recipient,
                subject: notification.subject,
                html: content
            });
            return true;
        } catch (error) {
            this.logger.error('Ошибка отправки email:', error);
            return false;
        }
    }
}

class PushSender implements INotificationSender {
    readonly channel = 'push';

    async send(notification: INotification, content: string): Promise<boolean> {
        try {
            await this.firebase.send({
                token: notification.recipient,
                notification: {
                    title: notification.data.title,
                    body: content
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}
```

## Транспортные события

```typescript
import {
    NotificationEvent,
    NotificationPersonallyEvent,
    NotificationTemplateChangedEvent
} from '@ts-core/notification-backend';

// Широковещательное уведомление
transport.dispatch(new NotificationEvent({
    type: 'system_update',
    data: { message: 'Запланировано техническое обслуживание' }
}));

// Персональное уведомление
transport.dispatch(new NotificationPersonallyEvent(userId, {
    type: 'order_shipped',
    data: { orderId: '123', trackingNumber: 'TRACK456' }
}));

// Событие изменения шаблона (для инвалидации кеша)
transport.dispatch(new NotificationTemplateChangedEvent(templateId));
```

## Полный пример настройки

### Модуль NestJS

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    NotificationEntity,
    NotificationTemplateEntity,
    NotificationPreferenceEntity,
    NotificationDatabaseService
} from '@ts-core/notification-backend';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            NotificationEntity,
            NotificationTemplateEntity,
            NotificationPreferenceEntity
        ])
    ],
    providers: [
        NotificationDatabaseService,
        NotificationService,
        NotificationLocaleService,
        EmailSender,
        PushSender,
        SmsSender
    ],
    controllers: [
        NotificationController,
        PreferenceController,
        TemplateController
    ],
    exports: [NotificationService]
})
export class NotificationModule {}
```

### Сервис уведомлений

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationServiceBase } from '@ts-core/notification-backend';

@Injectable()
export class NotificationService extends NotificationServiceBase {
    constructor(
        logger: Logger,
        database: NotificationDatabaseService,
        localeService: NotificationLocaleService,
        @Inject('SENDERS') senders: Map<string, INotificationSender>
    ) {
        super(logger, database, senders);
        this.localeService = localeService;
    }

    async sendWelcome(user: User): Promise<void> {
        await this.send({
            type: 'welcome',
            channel: 'email',
            recipient: user.email,
            locale: user.locale,
            data: {
                userName: user.name,
                appName: 'MyApp'
            }
        });
    }

    async sendOrderShipped(user: User, order: Order): Promise<void> {
        // Отправка по всем каналам
        const channels = ['email', 'push'];

        for (const channel of channels) {
            await this.send({
                type: 'order_shipped',
                channel,
                recipient: this.getRecipient(user, channel),
                locale: user.locale,
                data: {
                    orderId: order.id,
                    trackingNumber: order.trackingNumber
                }
            });
        }
    }

    private getRecipient(user: User, channel: string): string {
        switch (channel) {
            case 'email': return user.email;
            case 'push': return user.pushToken;
            case 'sms': return user.phone;
            default: return user.email;
        }
    }
}
```

### Миграции

```sql
-- Таблица уведомлений
CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    type VARCHAR NOT NULL,
    channel VARCHAR NOT NULL,
    recipient VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    data JSONB,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_date TIMESTAMP
);

-- Таблица шаблонов
CREATE TABLE notification_template (
    id SERIAL PRIMARY KEY,
    type VARCHAR NOT NULL,
    channel VARCHAR NOT NULL,
    locale VARCHAR NOT NULL DEFAULT 'ru',
    subject VARCHAR,
    content TEXT NOT NULL,
    UNIQUE(type, channel, locale)
);

-- Таблица настроек пользователя
CREATE TABLE notification_preference (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR NOT NULL,
    channel VARCHAR NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    UNIQUE(user_id, type, channel)
);

-- Индексы
CREATE INDEX idx_notification_status ON notification(status);
CREATE INDEX idx_notification_type_channel ON notification(type, channel);
CREATE INDEX idx_preference_user ON notification_preference(user_id);
```

## Связанные пакеты

| Пакет | Описание |
|-------|----------|
| `@ts-core/notification` | Общие интерфейсы и DTO |

## Автор

**Renat Gubaev** — [renat.gubaev@gmail.com](mailto:renat.gubaev@gmail.com)

- GitHub: [ManhattanDoctor](https://github.com/ManhattanDoctor)
- Репозиторий: [ts-core-notification-backend](https://github.com/ManhattanDoctor/ts-core-notification-backend)

## Лицензия

ISC
