import { Request, Response } from "express";
import prisma from "../../db/prisma";
import { HTTPStatus } from "../../services/http/status";
import { uploadFilesToPinata } from "../../services/products/upload.image.service";

export const createFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { farmerId, bio, location } = req.body;

    if (!farmerId || !location) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "farmerId and location are required" });
    }

    // ✅ Run DB check + Pinata upload in parallel
    const [existing, uploadedUrls] = await Promise.all([
      prisma.farmerProfile.findUnique({ where: { farmerId } }),
      req.file ? uploadFilesToPinata([req.file]) : Promise.resolve([]),
    ]);

    if (existing) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "Profile already exists for this farmer" });
    }

    const certificateUrl = uploadedUrls[0] ?? null;

    const profile = await prisma.farmerProfile.create({
      data: {
        farmerId,
        bio: bio || null,
        location,
        certificateUrl,
      },
    });

    return res
      .status(HTTPStatus.CREATED)
      .json({ message: "Farmer profile created successfully", profile });
  } catch (error) {
    console.error("[FarmerProfileController.create]", error);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const getFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.query;

    if (!farmerId) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "farmerId is required" });
    }

    const profile = await prisma.farmerProfile.findUnique({
      where: { farmerId: farmerId as string },
      include: { farmer: true },
    });

    if (!profile) {
      return res
        .status(HTTPStatus.NOT_FOUND)
        .json({ message: "Farmer profile not found" });
    }

    return res.status(HTTPStatus.OK).json({ profile });
  } catch (error) {
    console.error("[FarmerProfileController.get]", error);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const updateFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { farmerId, bio, location } = req.body;

    if (!farmerId) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "farmerId is required" });
    }


    const [existing, uploadedUrls] = await Promise.all([
      prisma.farmerProfile.findUnique({ where: { farmerId } }),
      req.file ? uploadFilesToPinata([req.file]) : Promise.resolve([]),
    ]);

    if (!existing) {
      return res
        .status(HTTPStatus.NOT_FOUND)
        .json({ message: "Farmer profile not found" });
    }

    const certificateUrl = uploadedUrls[0] ?? existing.certificateUrl ?? null;

    const updated = await prisma.farmerProfile.update({
      where: { farmerId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        certificateUrl,
      },
    });

    return res
      .status(HTTPStatus.OK)
      .json({ message: "Farmer profile updated successfully", profile: updated });
  } catch (error) {
    console.error("[FarmerProfileController.update]", error);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const updateTrustScore = async (req: Request, res: Response) => {
  try {
    const { farmerId, trustScore } = req.body;

    if (!farmerId || trustScore === undefined || isNaN(Number(trustScore))) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "farmerId and a valid trustScore are required" });
    }

    const updated = await prisma.farmerProfile.update({
      where: { farmerId },
      data: { trustScore: Number(trustScore) },
    });

    return res
      .status(HTTPStatus.OK)
      .json({ message: "Trust score updated successfully", profile: updated });
  } catch (error) {
    console.error("[FarmerProfileController.updateTrustScore]", error);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const updateRating = async (req: Request, res: Response) => {
  try {
    const { farmerId, rating } = req.body;

    if (!farmerId || rating === undefined || isNaN(Number(rating))) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "farmerId and a valid rating are required" });
    }

    const ratingNum = Number(rating);

    if (ratingNum < 0 || ratingNum > 5) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const updated = await prisma.farmerProfile.update({
      where: { farmerId },
      data: { rating: ratingNum },
    });

    return res
      .status(HTTPStatus.OK)
      .json({ message: "Rating updated successfully", profile: updated });
  } catch (error) {
    console.error("[FarmerProfileController.updateRating]", error);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const deleteFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.body;

    if (!farmerId) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ message: "farmerId is required" });
    }

    const existing = await prisma.farmerProfile.findUnique({
      where: { farmerId },
    });

    if (!existing) {
      return res
        .status(HTTPStatus.NOT_FOUND)
        .json({ message: "Farmer profile not found" });
    }

    await prisma.farmerProfile.delete({ where: { farmerId } });

    return res
      .status(HTTPStatus.OK)
      .json({ message: "Farmer profile deleted successfully" });
  } catch (error) {
    console.error("[FarmerProfileController.delete]", error);
    return res
      .status(HTTPStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};