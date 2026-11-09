# Hướng dẫn sử dụng quản trị phòng khám

Tài liệu này mô tả giao diện quản trị hiện có trong mã nguồn. Các chức năng cần backend, cơ sở dữ liệu và tài khoản phù hợp; dữ liệu hiển thị có thể khác tùy môi trường. Xem [README](../README.md) để khởi chạy hệ thống.

## 1. Đăng nhập và điều hướng

1. Mở `http://localhost:5173/login` hoặc địa chỉ frontend của phòng khám.
2. Chọn ô **Quản trị viên**, nhập tên đăng nhập và mật khẩu đã được cấp, sau đó chọn **Đăng nhập**. Thông tin được điền sẵn chỉ mang tính minh họa; cần có tài khoản tương ứng trong CSDL.
3. Sau khi đăng nhập, mở **Tổng Quan** tại `/dashboard`. Dùng menu bên trái để chuyển phân hệ. Trên màn hình nhỏ, mở menu bằng nút ở góc trên.
4. Chọn biểu tượng đăng xuất ở góc trên khi kết thúc phiên.

Nếu đăng nhập không thành công, kiểm tra tài khoản, mật khẩu, trạng thái tài khoản và kết nối API. Việc truy cập dữ liệu và các thao tác còn phụ thuộc quyền được backend cho phép.

## 2. Tổng quan

Chọn **Tổng Quan**. Màn hình trình bày các chỉ số, biểu đồ và danh sách liên quan hoạt động phòng khám. Dùng đây để theo dõi nhanh, sau đó vào từng phân hệ để đối chiếu chi tiết. Khi số liệu không như dự kiến, kiểm tra API và dữ liệu nguồn trước khi lập báo cáo.

## 3. Lịch hẹn

1. Chọn **Lịch Hẹn** (`/appointments`).
2. Nhập tên bệnh nhân, tên bác sĩ hoặc số điện thoại vào ô tìm kiếm; chọn bộ lọc **Tất cả**, **Chờ xác nhận**, **Đã xác nhận**, **Hoàn thành** hoặc **Đã hủy**.
3. Tại dòng lịch hẹn, dùng nút có tiêu đề **Xác nhận**, **Hoàn thành khám** hoặc **Hủy lịch** theo nghiệp vụ. Kiểm tra bệnh nhân, bác sĩ và thời gian trước khi thao tác.
4. Kiểm tra lại trạng thái sau thao tác; backend có thể từ chối chuyển trạng thái không hợp lệ.

Bệnh nhân có thể tạo yêu cầu tại trang `/dat-lich-kham`; việc khám và ghi nhận chuyên môn được thực hiện tại cổng bác sĩ.

## 4. Bệnh nhân

1. Chọn **Bệnh Nhân** (`/patients`) và tìm theo tên, số điện thoại hoặc mã.
2. Chọn **Thêm Bệnh Nhân Mới**, điền thông tin trên biểu mẫu và lưu. Đối chiếu thông tin định danh và liên hệ trước khi lưu.
3. Bảng có nút xem, sửa và xóa. Nút xem hiện chỉ mở thông báo tóm tắt; xóa cần được cân nhắc theo dữ liệu liên quan.

**Giới hạn hiện tại:** Màn hình sửa đang gọi hàm tạo bệnh nhân thay vì hàm cập nhật, nên không dùng để chỉnh sửa hồ sơ cho đến khi lỗi được sửa. Danh sách có thể tự hiển thị bệnh nhân mẫu khi API lỗi hoặc trả về rỗng; không xem đó là xác nhận dữ liệu thật trong CSDL. Một số thông tin hiển thị có giá trị mặc định khi thiếu dữ liệu nguồn.

## 5. Bác sĩ

1. Chọn **Bác Sĩ** (`/doctors-manage`), tìm theo tên, học vị hoặc chức danh. Có thể chuyển giữa chế độ thẻ và bảng.
2. Chọn thêm bác sĩ, điền họ tên, liên hệ, chuyên khoa và các thông tin chuyên môn theo biểu mẫu. Có thể chọn ảnh PNG, JPG hoặc WEBP và nhập thông tin tài khoản khi biểu mẫu yêu cầu.
3. Lưu và kiểm tra lại bác sĩ trong danh sách. Dùng nút sửa tại hồ sơ để cập nhật; dùng nút xóa và xác nhận nếu cần xóa.
4. Hệ thống có thể từ chối xóa khi bác sĩ có lịch hẹn, lịch sử khám hoặc lịch làm việc liên quan. Xử lý dữ liệu liên quan theo quy trình của phòng khám trước.

## 6. Bệnh án và đơn thuốc

- **Hồ Sơ Bệnh Án** (`/medical-records`): tìm theo bệnh nhân, mã bệnh án, chẩn đoán hoặc bác sĩ; chọn nút chi tiết tại dòng cần xem.
- **Đơn Thuốc** (`/prescriptions`): tìm theo bệnh nhân, mã đơn, bác sĩ hoặc chẩn đoán; mở chi tiết để xem nội dung.

Hai màn hình này chủ yếu phục vụ tra cứu. Việc khám và kê đơn thực hiện ở cổng bác sĩ, theo quyền và quy trình chuyên môn.

## 7. Hóa đơn và cổng kế toán

### Hóa đơn quản trị

1. Chọn **Hóa Đơn** (`/invoices`) và tìm theo mã, tên bệnh nhân hoặc số điện thoại.
2. Mở chi tiết hóa đơn để kiểm tra thông tin, số tiền và trạng thái. Với hóa đơn chưa thanh toán, giao diện có thao tác xác nhận thanh toán; chỉ thực hiện sau khi đã đối chiếu thực tế và kiểm tra kết quả trả về.

### Cổng kế toán

Chọn **Cổng Kế Toán** (`/accountant`) để mở quầy thu ngân, sổ hóa đơn, sổ quỹ và báo cáo. Tại quầy, tìm và chọn bệnh nhân trong hàng chờ, kiểm tra khoản thu, chọn phương thức và xác nhận theo giao diện; sổ hóa đơn hỗ trợ tìm kiếm và xem/in phiếu. Có nút đồng bộ lại dữ liệu.

**Giới hạn hiện tại:** Sổ quỹ có dữ liệu mẫu, phiếu thu/chi tạo ở giao diện được giữ trong trạng thái của trang, không nên coi là sổ kế toán đã lưu bền vững. Một số luồng có xử lý dự phòng khi API lỗi; cần xác minh thanh toán và hóa đơn trong hệ thống nguồn trước khi xác nhận với bệnh nhân hoặc chốt sổ. Chức năng và dữ liệu có thể khác theo phiên bản đang chạy.

## 8. Tài khoản

1. Chọn **Tài Khoản** (`/users`); tìm theo tên, tên đăng nhập, số điện thoại hoặc dùng bộ lọc vai trò.
2. Chọn thêm tài khoản, điền tên đăng nhập, mật khẩu, họ tên, vai trò và thông tin liên hệ. Nếu chọn bác sĩ, điền thêm thông tin chuyên khoa và hành nghề theo biểu mẫu. Lưu và kiểm tra thông báo.
3. Để khóa hoặc mở khóa, chọn nút tương ứng tại dòng tài khoản và xác nhận. Kiểm tra trạng thái sau khi danh sách tải lại.

Giao diện có thể gợi ý mật khẩu mặc định khi tạo tài khoản; hãy đặt mật khẩu riêng phù hợp quy định của đơn vị và bàn giao an toàn.

## 9. Xử lý sự cố thường gặp

- **Không tải được dữ liệu:** kiểm tra backend, `DATABASE_URL`, kết nối PostgreSQL, `VITE_API_URL`, CORS và quyền tài khoản; sau đó tải lại trang. Một danh sách hiển thị không đảm bảo API đang hoạt động vì có dữ liệu dự phòng.
- **Không lưu hoặc bị từ chối:** đọc thông báo, kiểm tra trường bắt buộc, quyền và ràng buộc dữ liệu. Không thực hiện lại thanh toán khi chưa kiểm tra trạng thái thực tế.
- **Không thấy hồ sơ:** xóa từ khóa và bộ lọc, kiểm tra môi trường CSDL và đối chiếu trực tiếp với API.
- **Số liệu không khớp:** kiểm tra thời gian, trạng thái và dữ liệu nguồn; một số khu vực vẫn có dữ liệu mẫu hoặc trạng thái cục bộ.
