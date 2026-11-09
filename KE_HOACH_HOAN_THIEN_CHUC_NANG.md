# Kế hoạch khắc phục chức năng phòng khám

Phạm vi: rà soát tĩnh các route, service và màn hình trên `main`. Đây không phải kiểm thử đầy đủ với CSDL hoặc đánh giá bảo mật toàn diện.

## Ưu tiên 0 — Ngăn kết quả sai và truy cập ngoài ý muốn

- [x] Bỏ tự đăng nhập admin bằng mật khẩu cố định và thử lại khi API trả 401/403 (`frontend/src/services/api.js`).
- [x] Bỏ đăng nhập/đăng ký thành công giả khi API lỗi; không khôi phục phiên mock (`authService.js`).
- [x] Không báo thu tiền thành công khi API cập nhật thất bại (`AccountantPortal.jsx`). Khi kết nối gián đoạn sau khi gửi, phải đối chiếu trạng thái hóa đơn trước khi thử lại.
- [x] Không thay dữ liệu bệnh nhân bằng danh sách mẫu khi API lỗi hoặc rỗng; báo lỗi tải và lỗi xóa. Ẩn thêm/sửa vì backend hiện không có API tương ứng; giao diện cũ có thể báo thành công giả hoặc tạo trùng.
- [ ] Kiểm tra quyền từng endpoint và bổ sung kiểm thử phân quyền các vai trò; giao diện không thay thế kiểm soát quyền phía server. Rà soát token cũ, cấu hình bí mật và tài khoản mặc định tại từng môi trường.

## Ưu tiên 1 — Hoàn thiện nghiệp vụ dữ liệu thật

- [ ] Thiết kế API tạo/cập nhật bệnh nhân cho admin/lễ tân, validate, xử lý trùng và ràng buộc; nối lại biểu mẫu sau khi có kiểm thử và thống nhất các trường được lưu.
- [ ] Loại bỏ các fallback thành công giả hoặc dữ liệu mẫu trong dịch vụ lịch hẹn, bác sĩ, thuốc, đơn thuốc, thống kê và hồ sơ bệnh nhân; hiển thị lỗi và trạng thái rỗng riêng biệt.
- [ ] Kiểm tra toàn bộ luồng khám → đơn → hóa đơn → thanh toán trên CSDL thử nghiệm; đảm bảo API có tính idempotent và giao diện chỉ hiển thị số tiền, chi tiết, quyền lợi BHYT do backend xác nhận. Quầy hiện có thông tin và mức giảm giả định.
- [ ] Thiết kế và lưu bền vững sổ quỹ, phiếu thu/chi và kết toán ca; loại bỏ dữ liệu mẫu và thông báo dễ gây hiểu nhầm trước khi dùng thực tế.

## Ưu tiên 2 — Hoàn thiện trải nghiệm và vận hành

- [ ] Nối các thao tác mô phỏng chuyển cận lâm sàng và đổi ca với API thực hoặc ghi rõ chưa hỗ trợ; kiểm tra trang lịch trực.
- [ ] Rà soát các trang chi tiết, tìm kiếm, phân trang, lỗi và dữ liệu mặc định; tránh tạo thông tin bệnh nhân, bác sĩ hoặc tiền phí giả.
- [ ] Bổ sung kiểm thử tích hợp cho đăng nhập, phân quyền, bệnh nhân, đặt lịch, kê đơn và thanh toán với dữ liệu thử nghiệm độc lập; bổ sung CI cho build và kiểm thử.
- [ ] Cập nhật hướng dẫn sau mỗi thay đổi; triển khai thử nghiệm nội bộ, đối chiếu dữ liệu và nghiệm thu với người phụ trách trước khi vận hành.
