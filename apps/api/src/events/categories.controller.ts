import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { Permissions, Roles } from 'src/auth/decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @Roles('ADMIN')
    @Permissions('MANAGE_CATEGORIES')
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @Permissions('MANAGE_CATEGORIES')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @Permissions('MANAGE_CATEGORIES')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
