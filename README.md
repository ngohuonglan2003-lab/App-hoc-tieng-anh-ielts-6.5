# IELTS 6.5 – Học từ vựng kiểu Duolingo

Web app (cài được như app trên điện thoại/iPad) để ôn IELTS mục tiêu 6.5: từ vựng, ngữ pháp, luyện nói, thi thử.

## Chạy app
- Máy tính: `python3 -m http.server 8000` trong thư mục này → mở http://localhost:8000
- Điện thoại/iPad: bật **GitHub Pages** (Settings → Pages → chọn nhánh) rồi mở link, chọn “Thêm vào màn hình chính”.
- Mở trực tiếp `index.html` vẫn được, nhưng khi đó dùng tab **Cài đặt → Tải file lên** để nạp từ vựng (đồng bộ cần https/localhost).

## Thêm từ vựng
Sửa `vocab/tu-vung.txt`, mỗi dòng một từ (xem hướng dẫn trong file). Cột tùy chọn: `từ | nghĩa Việt | chủ đề | câu ví dụ | link ảnh`.
App tự tìm phiên âm, audio US/UK, định nghĩa, câu mẫu (kèm dịch), đồng/trái nghĩa, cụm từ đi cùng, ảnh, video và nghĩa tiếng Việt.

## 🗺️ Lộ trình IELTS 6.5 (tab mặc định)
- **5 chặng** từ dễ đến khó: Nền tảng (4.5) → Tăng tốc (5.0) → Bứt phá (5.5) → Chinh phục (6.0) → Đích 6.5. Tổng 66 bài: 24 bài kỹ năng (lý thuyết + quiz), 13 chủ đề ngữ pháp, gói từ vựng (chủ đề cơ bản, Academic Word List 1–3, collocation, các chủ đề trong file của bạn), thử thách cuối chặng.
- Bản đồ kiểu trò chơi: bài khóa/mở, sao, “Bắt đầu”, thưởng xu khi xong bài/chặng.
- **Test đầu vào thích ứng**: phần đã biết được bỏ qua, chặng ≥ 85% bỏ qua cả chặng, dừng khi một chặng < 60%.
- **⚡ Vượt chặng** bất cứ lúc nào (đúng ≥ 85%).
- **Kiểm tra tuần (15 câu) / tháng (30 câu)**: tìm phần đã quên → đánh dấu ⚠ cần ôn, từ sai vào lượt ôn sớm nhất; app tự nhắc khi đến hạn.
- **Cẩm nang PDF**: `docs/cam-nang-ielts-6.5.pdf` (định dạng đề, bảng quy đổi band, lộ trình 16 tuần, sách theo chặng, toàn bộ lý thuyết, ngữ pháp, từ vựng). Tạo lại bằng `node tools/build-pdf.js` sau khi sửa `js/road-data.js`.

> Về bản quyền: app và cẩm nang không chứa nội dung sao chép từ sách IELTS có bản quyền. Sách được giới thiệu để mua/mượn bản chính hãng; đề mẫu miễn phí có link chính thức.

## Các phần của app
| Tab | Nội dung |
|---|---|
| 🗺️ Lộ trình | Bản đồ 5 chặng, test đầu vào, kiểm tra tuần/tháng, danh sách sách & tài liệu |
| 🏠 Luyện | Bài từ vựng (thẻ từ → trắc nghiệm → nghe → điền từ → xếp câu → nghe chép → đọc câu → viết → nói), **Ngữ pháp & cách dùng từ** (65 câu theo 13 chủ đề), thú cưng, rương quà |
| 🎤 Nói | Luyện nói theo cấu trúc IELTS Part 1/2/3: giám khảo hỏi, bạn trả lời bằng giọng nói, chấm 4 tiêu chí |
| 📝 Thi thử | Listening, Reading, Writing Task 1/2, Speaking, hoặc **thi đầy đủ**; chọn chủ đề đã học / mới / ngẫu nhiên; Band ước lượng từng kỹ năng + tổng |
| 📚 Từ vựng | Danh sách, tìm kiếm, xem thẻ chi tiết, **chọn lại ảnh minh họa** |
| 🪙 (bấm số xu trên cùng) | Cửa hàng: thú cưng, Băng đóng chuỗi, Tim dự phòng, Hộp quà |
| ⚙️ Cài đặt | File từ vựng, AI, ảnh, đồng bộ, tùy chỉnh |

Phần thưởng: +1 xu mỗi câu đúng, combo 5 câu liền +5, hoàn thành bài +10, bài hoàn hảo +10, lên cấp có quà, đạt mục tiêu ngày mở rương.

## Chấm điểm & đề thi
- **Listening/Reading**: có bộ đề dựng sẵn (3 bài đọc, 4 phần nghe, đủ dạng True/False/Not Given, trắc nghiệm, điền từ, nối tiêu đề). Điểm quy đổi theo bảng band Academic (thang 40 câu). Đề rút gọn nên chỉ là ước lượng.
- **Writing/Speaking không có AI**: chỉ ước lượng thô (độ dài, đa dạng từ, từ nối…), không thể đánh giá ngữ pháp/ý tưởng. Có nút **“Sao chép nhờ Claude chấm”** để dán vào ứng dụng Claude (miễn phí theo gói của bạn).
- **Bật AI (khuyên dùng)**: Cài đặt → dán API key Claude (console.anthropic.com). Khi đó app tạo **đề Reading/Listening/Writing/Speaking mới theo chủ đề bất kỳ**, độ khó tăng dần như đề thật, và chấm Writing/Speaking như giám khảo, kèm sửa câu và bài mẫu. Key chỉ lưu trong trình duyệt của bạn; mỗi lần dùng tính phí theo tài khoản Anthropic (thường vài cent). Không dùng trên máy dùng chung. Phát âm chỉ ước lượng từ độ nhận dạng giọng nói của trình duyệt.
- Ghi âm cần Chrome/Edge hoặc Safari; Firefox thì gõ câu trả lời.

## Ảnh minh họa
Ảnh tự động lấy từ Openverse / Wikimedia / Wikipedia, từ trừu tượng có thể chưa sát nghĩa. Bấm **🔎 Tìm ảnh** ở thẻ từ để tìm theo từ khóa khác và “ghim” ảnh bạn chọn (bài tập hình ảnh chỉ dùng ảnh bạn đã ghim). Thêm key **Pixabay** (miễn phí) ở Cài đặt để có ảnh chất lượng hơn.

## Đồng bộ iPad ↔ điện thoại (ID + mật khẩu)
Dữ liệu được **mã hóa AES-GCM trên máy bạn** rồi mới gửi lên máy chủ, nên máy chủ không đọc được. Cần 1 lần thiết lập máy chủ miễn phí (Cloudflare Workers, ~5 phút):
1. Tạo tài khoản miễn phí tại cloudflare.com → **Workers & Pages → Create → Worker**, đặt tên (vd `ielts-sync`) → Deploy → **Edit code**, dán toàn bộ nội dung `worker/sync-worker.js` → Deploy.
2. **Storage & Databases → KV → Create namespace** (vd `ielts-sync-kv`).
3. Vào Worker → **Settings → Bindings → Add → KV namespace**: Variable name đúng là `SYNC`, chọn namespace vừa tạo → Deploy.
4. Chép địa chỉ Worker (dạng `https://ielts-sync.tên-bạn.workers.dev`).
5. Trên **từng thiết bị**: Cài đặt → Đồng bộ → nhập địa chỉ đó, một **ID** bất kỳ và **mật khẩu** (giống nhau ở mọi thiết bị) → Kết nối.

App tự gộp dữ liệu khi mở, sau mỗi bài học và khi quay lại app. Quên mật khẩu thì không khôi phục được. Không muốn dựng máy chủ: dùng **mã đồng bộ** (Cài đặt → Sao chép mã / Nhập mã).
