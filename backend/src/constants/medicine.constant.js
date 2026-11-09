// Ngưỡng cảnh báo tồn kho thấp mặc định (số lượng tồn <= ngưỡng sẽ được cảnh báo)
const DEFAULT_LOW_STOCK_THRESHOLD = 10;

// Số ngày cảnh báo cận hạn sử dụng mặc định (thuốc hết hạn trong vòng 30 ngày tới)
const DEFAULT_EXPIRY_WARNING_DAYS = 30;

// Các trạng thái tồn kho dùng để lọc
const STOCK_STATUS = {
    ALL: "all",
    IN_STOCK: "in_stock",         // Còn hàng (soluongton > threshold)
    LOW_STOCK: "low_stock",       // Sắp hết hàng (0 < soluongton <= threshold)
    OUT_OF_STOCK: "out_of_stock", // Hết hàng (soluongton = 0)
    EXPIRED: "expired",           // Đã hết hạn (hansudung < hôm nay)
    NEAR_EXPIRY: "near_expiry",   // Cận hạn dùng (hết hạn trong 30 ngày)
};

const VALID_STOCK_STATUSES = Object.values(STOCK_STATUS);

module.exports = {
    DEFAULT_LOW_STOCK_THRESHOLD,
    DEFAULT_EXPIRY_WARNING_DAYS,
    STOCK_STATUS,
    VALID_STOCK_STATUSES,
};
