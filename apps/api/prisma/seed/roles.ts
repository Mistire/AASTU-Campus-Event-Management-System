import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Roles and Permissions...');

    // 1. Create permissions
    const permissions = [
        { name: 'CREATE_EVENT', description: 'Can create new events' },
        { name: 'UPDATE_EVENT', description: 'Can update existing events' },
        { name: 'DELETE_EVENT', description: 'Can delete events' },
        { name: 'APPROVE_EVENT', description: 'Can approve or reject pending events' },
        { name: 'MANAGE_USERS', description: 'Can manage platform users' },
        { name: 'VIEW_EVENTS', description: 'Can browse and view events' },
        { name: 'REGISTER_EVENT', description: 'Can register for an event' },
        { name: 'MANAGE_CATEGORIES', description: 'Can manage event categories' },
        { name: 'MANAGE_ROLES', description: 'Can manage roles and permissions' },
        { name: 'MANAGE_VENUES', description: 'Can manage event venues' },
        { name: 'MANAGE_INTERESTS', description: 'Can manage student interests' },
        { name: 'MANAGE_ATTENDANCE', description: 'Can manage event attendance' },
        { name: 'VIEW_FEEDBACK', description: 'Can view user feedback' },
        { name: 'MANAGE_DEPARTMENTS', description: 'Can manage campus departments' },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        });
    }
    console.log('Permissions seeded.');

    // Fetch all permissions to link them
    const allPerms = await prisma.permission.findMany();

    // 2. Create Roles
    const roles = [
        {
            roleName: 'ADMIN',
            description: 'System Administrator',
            perms: allPerms.map((p) => p.name), // All permissions
        },
        {
            roleName: 'ORGANIZER',
            description: 'Event Organizer',
            perms: [
                'CREATE_EVENT',
                'UPDATE_EVENT',
                'VIEW_EVENTS',
                'REGISTER_EVENT',
            ],
        },
        {
            roleName: 'STUDENT',
            description: 'Standard Student Participant',
            perms: ['VIEW_EVENTS', 'REGISTER_EVENT'],
        },
    ];

    for (const r of roles) {
        const roleRecord = await prisma.role.upsert({
            where: { roleName: r.roleName },
            update: {},
            create: {
                roleName: r.roleName,
                description: r.description,
            },
        });

        // Link permissions to role
        for (const pName of r.perms) {
            const permRecord = allPerms.find((p) => p.name === pName);
            if (permRecord) {
                // Find existing to avoid unique constraint error
                const existingRp = await prisma.rolePermission.findFirst({
                    where: { roleId: roleRecord.id, permissionId: permRecord.id },
                });

                if (!existingRp) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: roleRecord.id,
                            permissionId: permRecord.id,
                        },
                    });
                }
            }
        }
    }

    console.log('Roles and RolePermissions seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
