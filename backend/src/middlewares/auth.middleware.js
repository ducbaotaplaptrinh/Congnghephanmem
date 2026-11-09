const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Không có Authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập",
            });
        }

        const [type, token] = authHeader.split(" ");
        if (type != "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Định dạng token không hợp lệ",
            });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
}

function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(" ");
            if (type === "Bearer" && token) {
                const decoded = verifyToken(token);
                req.user = decoded;
            }
        }
    } catch {
        req.user = null;
    }
    next();
}

module.exports = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;

