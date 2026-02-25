import prisma from "../../db/prisma";
export class ProductService {
  static async getById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId }
    });
  }

  static async create(data: {
    name: string;
    pinataImageUrl: string;
    category?: string;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        pinataImageUrl: data.pinataImageUrl,
        category: data.category
      }
    });
  }

  static async updateImage(productId: string, pinataImageUrl: string) {
    return prisma.product.update({
      where: { id: productId },
      data: { pinataImageUrl }
    });
  }

  static async deactivate(productId: string) {
    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });
  }

  static async listActive() {
    return prisma.product.findMany({
      where: { isActive: true }
    });
  }
}