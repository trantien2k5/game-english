# Project Rules: game-english

## Hành vi cơ bản của AI (General Behaviors)
- **Kiểm tra cú pháp (Syntax Checking)**: Bắt buộc phải tự động kiểm tra cú pháp (Syntax error) ngay sau khi chỉnh sửa hoặc tạo mới file Javascript trước khi kết thúc tác vụ (sử dụng các công cụ rà soát lỗi tương ứng). Tuyệt đối không bàn giao mã nguồn khi chưa chắc chắn mã không bị lỗi cú pháp làm sập ứng dụng.

## Tiêu chuẩn Công nghệ & Thiết kế (Technology & Design Guidelines)
- **Công nghệ UI**: Bắt buộc chỉ sử dụng Vanilla CSS thuần túy. Không sử dụng TailwindCSS, Bootstrap hay bất kỳ thư viện UI nào khác.
- **Phong cách thiết kế (Aesthetics)**: Sử dụng phong cách thiết kế hiện đại, cao cấp, chú trọng trải nghiệm người dùng. Duy trì ngôn ngữ thiết kế **Glassmorphism** (nền kính mờ trong suốt), kết hợp với hiệu ứng hover mượt mà, viền bo góc bo tròn, màu sắc tương phản rõ ràng.
- **Trải nghiệm người dùng (UX)**: Giao diện phải đảm bảo tính Responsive (thích ứng mọi màn hình). Các màn hình chức năng phức tạp (Tạo đề thi, Xem chi tiết) nên ưu tiên thiết kế bố cục dạng 2 cột trên màn hình lớn để hạn chế thao tác cuộn chuột quá nhiều.
