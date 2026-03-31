import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'admin@aastu.edu.et' },
            include: { role: { include: { permissions: { include: { permission: true } } } } }
        });
        console.log(JSON.stringify(user, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
