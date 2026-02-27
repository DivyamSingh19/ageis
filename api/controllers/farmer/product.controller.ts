import prisma from "../../db/prisma";
import { Request, Response } from "express";
import { HTTPStatus } from "../../services/http/status";
import { uploadFilesToPinata } from "../../services/products/upload.image.service";
import { getAgeisClient } from "../../blockchain/server.client";

export class ProductController {
  create = async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        price,
        productionDate,
        category,
        farmLocation,
        farmerId
      } = req.body;



      if (!farmerId) {
        return res
          .status(HTTPStatus.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      if (!name || !description || !price || !productionDate) {
        return res
          .status(HTTPStatus.BAD_REQUEST)
          .json({ message: "name, description, price, and productionDate are required" });
      }

      // Handle image uploads
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res
          .status(HTTPStatus.BAD_REQUEST)
          .json({ message: "At least one product image is required" });
      }

      const pinataImageUrls = await uploadFilesToPinata(files);

      const checkFarmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
      });

      if (!checkFarmer) {
        return res
          .status(HTTPStatus.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      const product = await prisma.products.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          productionDate: new Date(productionDate),
          pinataImageUrl: pinataImageUrls,
          category,
          farmLocation,
          farmerId,
        },
      });

      return res
        .status(HTTPStatus.CREATED)
        .json({ message: "Product created successfully", product });
    } catch (error) {
      console.error("[ProductController.create]", error);
      return res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.body;
      const farmerId = req.farmerId;

      if (!farmerId) {
        return res
          .status(HTTPStatus.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      const product = await prisma.products.findUnique({ where: { id } });

      if (!product) {
        return res
          .status(HTTPStatus.NOT_FOUND)
          .json({ message: "Product not found" });
      }

      if (product.farmerId !== farmerId) {
        return res
          .status(HTTPStatus.FORBIDDEN)
          .json({ message: "Forbidden: You do not own this product" });
      }

      await prisma.products.delete({ where: { id } });

      return res
        .status(HTTPStatus.OK)
        .json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("[ProductController.delete]", error);
      return res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.body
      const farmerId = req.farmerId;

      if (!farmerId) {
        return res
          .status(HTTPStatus.UNAUTHORIZED)
          .json({ message: "Unauthorized" });
      }

      const product = await prisma.products.findUnique({ where: { id } });

      if (!product) {
        return res
          .status(HTTPStatus.NOT_FOUND)
          .json({ message: "Product not found" });
      }

      if (product.farmerId !== farmerId) {
        return res
          .status(HTTPStatus.FORBIDDEN)
          .json({ message: "Forbidden: You do not own this product" });
      }

      // Only name, description, and quantity are user-editable
      const { name, description, quantity } = req.body;

      if (!name && !description && !quantity) {
        return res
          .status(HTTPStatus.BAD_REQUEST)
          .json({ message: "At least one of name, description, or quantity must be provided" });
      }

      const updated = await prisma.products.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(quantity && { quantity: parseInt(quantity) }),
        },
        include: {
          farmer: {
            select: { name: true },
          },
        },
      });

      return res
        .status(HTTPStatus.OK)
        .json({ message: "Product updated successfully", product: updated });
    } catch (error) {
      console.error("[ProductController.update]", error);
      return res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      const product = await prisma.products.findUnique({
        where: { id },
        include: {
          farmer: {
            select: { name: true },
          },
        },
      });

      if (!product) {
        return res
          .status(HTTPStatus.NOT_FOUND)
          .json({ message: "Product not found" });
      }

      return res.status(HTTPStatus.OK).json({ product });
    } catch (error) {
      console.error("[ProductController.getById]", error);
      return res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  getNftInfo = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      const product = await prisma.products.findUnique({
        where: { id },
        include: {
          nft: true,
        },
      });

      if (!product) {
        return res.status(HTTPStatus.NOT_FOUND).json({ message: "Product not found" });
      }

      const client = getAgeisClient();
      const trace = await client.fetchProductTrace(product.id);

      const onChainTrace = trace
        ? {
          orderId: trace.orderId,
          nftMint: trace.nftMint.toBase58(),
          farmerWallet: trace.farmerWallet.toBase58(),
          productName: trace.productName,
          metadataUri: trace.metadataUri,
          createdAt: trace.createdAt.toString(),
          bump: trace.bump,
        }
        : null;

      const mintAddress = product.nft?.tokenId ?? onChainTrace?.nftMint ?? null;

      return res.status(HTTPStatus.OK).json({
        verified: product.verified,
        mintAddress,
        onChainTrace,
      });
    } catch (error) {
      console.error("[ProductController.getNftInfo]", error);
      return res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };

  all = async (req: Request, res: Response) => {
    try {
      const {
        page = "1",
        limit = "100",
        category,
        farmLocation,
        minPrice,
        maxPrice,
        verified,
        search,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {
        farmerId: req.farmerId, // Only show products for the authenticated farmer
        ...(category && { category: category as string }),
        ...(farmLocation && { farmLocation: farmLocation as string }),
        ...(verified !== undefined && { verified: verified === "true" }),
        ...(minPrice || maxPrice
          ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice as string) }),
              ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
            },
          }
          : {}),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: "insensitive" } },
            { description: { contains: search as string, mode: "insensitive" } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        prisma.products.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            farmer: {
              select: { name: true },
            },
          },
        }),
        prisma.products.count({ where }),
      ]);

      return res.status(HTTPStatus.OK).json({
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("[ProductController.all]", error);
      return res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
}