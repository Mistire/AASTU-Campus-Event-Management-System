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
import { EventTypesService } from './event-types.service';
import { EventTypesController } from './event-types.controller';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';

@Module({
  controllers: [
    EventsController,
    VenuesController,
    CategoriesController,
    SessionsController,
    OrganizersController,
    EventTypesController,
    TagsController,
    AnnouncementsController,
    InvitationsController,
  ],
  providers: [
    EventsService,
    VenuesService,
    CategoriesService,
    SessionsService,
    OrganizersService,
    EventTypesService,
    TagsService,
    AnnouncementsService,
    InvitationsService,
  ],
  exports: [EventsService, VenuesService, CategoriesService, EventTypesService, TagsService],
})
export class EventsModule {}
