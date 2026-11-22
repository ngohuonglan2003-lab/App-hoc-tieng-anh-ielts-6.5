# IELTS 6.5 – Học từ vựng kiểu Duolingo

Web app (chạy được như app trên điện thoại) giúp ôn từ vựng IELTS mục tiêu 6.5.

## Cách dùng
1. **Thêm từ**: mở `vocab/tu-vung.txt`, mỗi dòng một từ (chỉ cần gõ từ tiếng Anh). Cột tùy chọn: `từ | nghĩa Việt | chủ đề | câu ví dụ | link ảnh`.
2. **Chạy app** (cần máy chủ web, vì app đọc file từ vựng):
   - Máy tính: `python3 -m http.server 8000` trong thư mục này rồi mở http://localhost:8000
   - Điện thoại: bật **GitHub Pages** (Settings → Pages → chọn nhánh) rồi mở link, chọn "Thêm vào màn hình chính".
   - Mở trực tiếp `index.html` vẫn được: dùng tab **Cài đặt → Tải file lên**.
3. Sửa file → tải lại trang (hoặc Cài đặt → Tải lại file).

## App tự tạo cho mỗi từ (miễn phí, không cần API key)
| Nội dung | Nguồn |
|---|---|
| Phiên âm, audio US/UK, định nghĩa, câu mẫu | dictionaryapi.dev (+ giọng đọc của trình duyệt khi thiếu audio) |
| Đồng/trái nghĩa, cụm từ đi kèm | Datamuse |
| Câu mẫu thật kèm bản dịch Việt | Tatoeba |
| Nghĩa tiếng Việt | MyMemory (có thể ghi đè ở cột 2) |
| Hình ảnh | Openverse / Wikipedia |
| Video người bản xứ nói từ đó | YouGlish (nhúng) + link YouTube/Cambridge |

Kết quả được lưu trong trình duyệt nên lần sau học offline vẫn được với các từ đã tải.

## Cách học
Thẻ từ mới → trắc nghiệm nghĩa/định nghĩa → nghe → điền từ vào câu → viết từ → đồng nghĩa → nói (micro).
Có XP, chuỗi ngày, 5 tim mỗi bài, mục tiêu ngày, và **lặp lại ngắt quãng** (hộp Leitner 1-2-4-8-16-32 ngày): từ sai sẽ được ôn lại sớm.
