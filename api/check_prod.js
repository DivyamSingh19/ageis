const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
    const product = await prisma.products.findUnique({
        where: { id: '0cc1426e-4f9d-4982-8c74-a0bf6e8fe501' }
    });
    console.log('Product Name:', product.name);
    console.log('Product Name Length:', product.name.length);
    process.exit(0);
}

checkProduct();
