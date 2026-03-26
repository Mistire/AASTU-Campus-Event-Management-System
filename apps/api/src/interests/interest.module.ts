import { Module } from '@nestjs/common';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';

@Module({
    providers: [InterestService],
    controllers: [InterestController],
    exports: [InterestService]
})
export class InterestModule { }
