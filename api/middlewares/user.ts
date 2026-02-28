import { Request, Response, NextFunction } from "express";
import { HTTPStatus } from "../services/http/status";
import { validateToken } from "../utils/tokens";


export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(HTTPStatus.UNAUTHORIZED).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded: any = await validateToken(token);

        if (!decoded || !decoded.id) {
            return res.status(HTTPStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: (error as Error).message
        })
    }
}