import { Request, Response } from "express";
import { HTTPStatus } from "../../services/http/status";
import prisma from "../../db/prisma";

export class OnboardingController {
    complete = async (req: Request, res: Response) => {
        try {
            const { farmerId } = req.body;

            if (!farmerId) {
                return res
                    .status(HTTPStatus.BAD_REQUEST)
                    .json({ message: "farmerId is required" });
            }

            const farmer = await prisma.farmer.findUnique({
                where: { id: farmerId },
            });

            if (!farmer) {
                return res
                    .status(HTTPStatus.NOT_FOUND)
                    .json({ message: "Farmer not found" });
            }

            if (farmer.onboardingComplete) {
                return res
                    .status(HTTPStatus.BAD_REQUEST)
                    .json({ message: "Onboarding already completed" });
            }

            const updated = await prisma.farmer.update({
                where: { id: farmerId },
                data: { onboardingComplete: true },
            });

            return res.status(HTTPStatus.OK).json({
                message: "Onboarding completed successfully",
                data: {
                    id: updated.id,
                    onboardingComplete: updated.onboardingComplete,
                },
            });
        } catch (error) {
            return res
                .status(HTTPStatus.INTERNAL_SERVER_ERROR)
                .json({ message: "Failed to complete onboarding", error: (error as Error).message });
        }
    };
}
