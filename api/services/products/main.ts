import prisma from "../../db/prisma";

export class ProductService {
  static async getById(productId: string) {
    return prisma.products.findUnique({
      where: { id: productId }
    });
  }

  static async create(data: {
    name: string;
    pinataImageUrl: string;
    category?: string;
  }) {
    return prisma.products.create({
      data: {
        name: data.name,
        description: "No Description Provided",
        price: 0,
        productionDate: new Date(),
        pinataImageUrl: data.pinataImageUrl ? [data.pinataImageUrl] : [],
        category: data.category,
        farmerId: "dummy-farmer-id"
      }
    });
  }

  static async updateImage(productId: string, pinataImageUrl: string) {
    return prisma.products.update({
      where: { id: productId },
      data: { pinataImageUrl: pinataImageUrl ? [pinataImageUrl] : [] }
    });
  }

  static async deactivate(productId: string) {
    return prisma.products.update({
      where: { id: productId },
      data: { isActive: false }
    });
  }

  static async listActive() {
    return prisma.products.findMany({
      where: { isActive: true }
    });
  }
}