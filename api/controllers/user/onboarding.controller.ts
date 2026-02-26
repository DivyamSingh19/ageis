import { Request, Response } from "express";
import { HTTPStatus } from "../../services/http/status";
import prisma from "../../db/prisma";

export class OnboardingController {
    complete = async (req: Request, res: Response) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res
                    .status(HTTPStatus.BAD_REQUEST)
                    .json({ message: "userId is required" });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res
                    .status(HTTPStatus.NOT_FOUND)
                    .json({ message: "User not found" });
            }

            if (user.onboardingComplete) {
                return res
                    .status(HTTPStatus.BAD_REQUEST)
                    .json({ message: "Onboarding already completed" });
            }

            const updated = await prisma.user.update({
                where: { id: userId },
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
