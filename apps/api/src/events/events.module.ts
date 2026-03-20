import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';

@Module({
    controllers: [
        EventsController,
        VenuesController,
        CategoriesController,
        SessionsController,
        OrganizersController,
    ],
    providers: [
        EventsService,
        VenuesService,
        CategoriesService,
        SessionsService,
        OrganizersService,
    ],
    exports: [EventsService, VenuesService, CategoriesService],
})
export class EventsModule { }
