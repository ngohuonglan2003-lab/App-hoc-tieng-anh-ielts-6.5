'use strict';
/* ===== Dữ liệu lộ trình IELTS 6.5: gói từ vựng, bài kỹ năng, 5 chặng, tài liệu tham khảo =====
   Nội dung bài học do app tự soạn dựa trên định dạng đề IELTS Academic công khai. */

/* ---------- Gói từ vựng (từ|nghĩa) ---------- */
const PACK_SRC = {
  daily: ['Cuộc sống hằng ngày', `routine|thói quen hằng ngày
convenient|tiện lợi
schedule|lịch trình
leisure|thời gian rảnh rỗi
hobby|sở thích
relax|thư giãn
busy|bận rộn
weekend|cuối tuần
habit|thói quen
prefer|thích hơn
usually|thường thường
household chores|việc nhà`],
  family: ['Gia đình & bạn bè', `relative|họ hàng
sibling|anh chị em ruột
close-knit|gắn bó khăng khít
get along with|hòa hợp với
generation|thế hệ
raise|nuôi dạy
support|ủng hộ, hỗ trợ
trust|tin tưởng
childhood|tuổi thơ
elderly|người cao tuổi
responsibility|trách nhiệm
spend time with|dành thời gian với`],
  hometown: ['Quê hương & nơi chốn', `hometown|quê hương
neighbourhood|khu phố
crowded|đông đúc
peaceful|yên bình
facilities|cơ sở vật chất
landmark|địa danh nổi tiếng
suburb|ngoại ô
rural|thuộc nông thôn
urban|thuộc thành thị
local|thuộc địa phương
traffic jam|kẹt xe
atmosphere|bầu không khí`],
  studywork: ['Học tập & công việc', `degree|bằng cấp
graduate|tốt nghiệp
colleague|đồng nghiệp
salary|tiền lương
part-time|bán thời gian
experience|kinh nghiệm
skill|kỹ năng
deadline|hạn chót
knowledge|kiến thức
assignment|bài tập lớn
interview|cuộc phỏng vấn
qualification|bằng cấp, chứng chỉ`],
  awl1: ['Academic Word List 1', `analyse|phân tích
approach|cách tiếp cận
area|khu vực, lĩnh vực
assess|đánh giá
assume|cho rằng, giả định
authority|chính quyền, thẩm quyền
available|có sẵn
benefit|lợi ích
concept|khái niệm
consist|bao gồm (consist of)
constitute|cấu thành
context|bối cảnh
contract|hợp đồng
create|tạo ra
data|dữ liệu
define|định nghĩa
derive|bắt nguồn từ
distribute|phân phối
economy|nền kinh tế
environment|môi trường
establish|thành lập, thiết lập
estimate|ước tính
evident|hiển nhiên, rõ ràng
export|xuất khẩu
factor|yếu tố
finance|tài chính
formula|công thức
function|chức năng
identify|xác định, nhận diện
income|thu nhập
indicate|chỉ ra, cho thấy
individual|cá nhân
interpret|diễn giải
involve|liên quan, bao gồm
issue|vấn đề
labour|lao động
legal|hợp pháp
legislate|ban hành luật
major|chính, chủ yếu
method|phương pháp
occur|xảy ra
percent|phần trăm
period|giai đoạn
policy|chính sách
principle|nguyên tắc
proceed|tiến hành
process|quá trình
require|yêu cầu
research|nghiên cứu
respond|phản hồi
role|vai trò
section|phần, mục
sector|ngành, khu vực kinh tế
significant|đáng kể, quan trọng
similar|tương tự
source|nguồn
specific|cụ thể
structure|cấu trúc
theory|lý thuyết
vary|thay đổi, khác nhau`],
  awl2: ['Academic Word List 2', `achieve|đạt được
acquire|thu được, tiếp thu
administrate|quản lý, điều hành
affect|ảnh hưởng
appropriate|phù hợp
aspect|khía cạnh
assist|hỗ trợ
category|hạng mục, loại
chapter|chương
commission|ủy ban
community|cộng đồng
complex|phức tạp
compute|tính toán
conclude|kết luận
conduct|tiến hành
consequent|do đó xảy ra, hệ quả
construct|xây dựng
consume|tiêu thụ
credit|tín dụng; sự công nhận
culture|văn hóa
design|thiết kế
distinct|khác biệt rõ rệt
element|yếu tố, thành phần
equate|đánh đồng
evaluate|đánh giá
feature|đặc điểm
final|cuối cùng
focus|tập trung
impact|tác động
injure|làm bị thương
institute|viện; thiết lập
invest|đầu tư
item|món, mục
journal|tạp chí chuyên ngành
maintain|duy trì
normal|bình thường
obtain|có được, đạt được
participate|tham gia
perceive|nhận thức, cảm nhận
positive|tích cực
potential|tiềm năng
previous|trước đó
primary|chính; tiểu học
purchase|mua
range|phạm vi
region|vùng
regulate|điều tiết, quản lý
relevant|liên quan
reside|cư trú
resource|tài nguyên, nguồn lực
restrict|hạn chế
secure|an toàn; giành được
seek|tìm kiếm
select|lựa chọn
site|địa điểm
strategy|chiến lược
survey|khảo sát
text|văn bản
tradition|truyền thống
transfer|chuyển giao`],
  awl3: ['Academic Word List 3', `alternative|lựa chọn thay thế
circumstance|hoàn cảnh
comment|bình luận
compensate|bồi thường, bù đắp
component|thành phần
consent|sự đồng ý
considerable|đáng kể
constant|liên tục, không đổi
constrain|hạn chế, ràng buộc
contribute|đóng góp
convene|triệu tập
coordinate|phối hợp
core|cốt lõi
corporate|thuộc doanh nghiệp
correspond|tương ứng
criteria|tiêu chí
deduce|suy ra
demonstrate|chứng minh
document|tài liệu
dominate|chiếm ưu thế
emphasis|sự nhấn mạnh
ensure|đảm bảo
exclude|loại trừ
framework|khuôn khổ
fund|quỹ; tài trợ
illustrate|minh họa
immigrate|nhập cư
imply|ngụ ý
initial|ban đầu
instance|ví dụ, trường hợp
interact|tương tác
justify|biện minh
layer|lớp, tầng
link|liên kết
locate|xác định vị trí
maximise|tối đa hóa
minor|nhỏ, thứ yếu
negate|phủ nhận, vô hiệu hóa
outcome|kết quả
partner|đối tác
philosophy|triết lý
physical|thuộc thể chất
proportion|tỉ lệ
publish|xuất bản
react|phản ứng
register|đăng ký
rely|dựa vào
remove|loại bỏ
scheme|kế hoạch, chương trình
sequence|trình tự
shift|sự dịch chuyển, thay đổi
specify|chỉ rõ
sufficient|đủ
task|nhiệm vụ
technical|thuộc kỹ thuật
technique|kỹ thuật, phương pháp
technology|công nghệ
valid|hợp lệ, có giá trị
volume|khối lượng; âm lượng`],
  colloc: ['Collocation ăn điểm', `play a crucial role|đóng vai trò then chốt
have a significant impact on|có tác động đáng kể đến
raise awareness|nâng cao nhận thức
pose a threat|gây ra mối đe dọa
take measures|áp dụng biện pháp
meet the demand|đáp ứng nhu cầu
a growing number of|ngày càng nhiều
strike a balance|cân bằng (giữa hai điều)
bridge the gap|thu hẹp khoảng cách
reach a consensus|đạt được đồng thuận
tackle the problem|giải quyết vấn đề
reap the benefits|gặt hái lợi ích
draw a conclusion|rút ra kết luận
in the long run|về lâu dài
on a daily basis|hằng ngày`]
};

/* Tách gói lớn thành gói nhỏ ~15 từ */
const PACKS = {};
for (const [id, [title, src]] of Object.entries(PACK_SRC)) {
  const words = src.trim().split('\n').map(l => { const [word, vi] = l.split('|'); return { word: word.trim(), vi: vi.trim() }; });
  if (words.length <= 16) PACKS[id] = { id, title, words };
  else for (let i = 0, n = 0; i < words.length; i += 15, n++) {
    const pid = id + 'abcd'[n];
    PACKS[pid] = { id: pid, title: `${title} (${n + 1}/${Math.ceil(words.length / 15)})`, words: words.slice(i, i + 15) };
  }
}

/* ---------- Bài kỹ năng: lý thuyết + quiz [câu hỏi, [lựa chọn], chỉ số đúng, giải thích] ---------- */
const LESSONS = {
  's1-format': { icon: '🗺️', title: 'Hiểu bài thi IELTS', body: `
<p>IELTS Academic gồm <b>4 kỹ năng</b>, tổng khoảng 2 giờ 45 phút. Listening, Reading, Writing thi liền nhau không nghỉ; Speaking có thể cùng ngày hoặc trong vòng 7 ngày.</p>
<ul><li><b>Listening</b> – khoảng 30 phút, 40 câu, 4 phần (bản giấy có thêm 10 phút chép đáp án).</li>
<li><b>Reading</b> – 60 phút, 40 câu, 3 bài đọc dài lấy từ sách, báo, tạp chí.</li>
<li><b>Writing</b> – 60 phút, 2 bài: Task 1 mô tả biểu đồ/bảng/quy trình/bản đồ (≥150 từ), Task 2 viết luận (≥250 từ). <b>Task 2 tính điểm gấp đôi Task 1.</b></li>
<li><b>Speaking</b> – 11–14 phút, 3 phần, nói trực tiếp với giám khảo.</li></ul>
<p>Mỗi kỹ năng chấm theo thang 0–9. <b>Overall = trung bình 4 kỹ năng, làm tròn đến 0.5 gần nhất</b> (6.25 → 6.5; 6.75 → 7.0).</p>
<p>🎯 Để đạt 6.5: Listening khoảng <b>26–29/40</b> câu đúng, Reading Academic khoảng <b>27–29/40</b>. Ví dụ L 7.0 + R 6.5 + W 6.0 + S 6.5 = 26 ÷ 4 = 6.5. Nên cố để không kỹ năng nào dưới 6.0.</p>`,
    quiz: [['Writing Task 2 so với Task 1 được tính điểm thế nào?', ['Bằng nhau', 'Gấp đôi Task 1', 'Bằng một nửa', 'Không tính'], 1, 'Task 2 chiếm trọng số gấp đôi Task 1.'],
      ['Để đạt Listening 6.5, cần khoảng bao nhiêu câu đúng/40?', ['15–17', '19–22', '26–29', '35–36'], 2, 'Theo bảng quy đổi, 26–29 câu ≈ band 6.5.'],
      ['L 7.0, R 6.5, W 5.5, S 6.0 → Overall là?', ['6.0', '6.25', '6.5', '7.0'], 2, 'Trung bình 6.25 được làm tròn lên 6.5.'],
      ['Phần Speaking kéo dài khoảng?', ['5 phút', '11–14 phút', '30 phút', '60 phút'], 1, 'Speaking 11–14 phút, gồm 3 phần.']] },

  's1-listen-form': { icon: '🎧', title: 'Listening Part 1: Điền form (tên, số, ngày)', body: `
<p>Phần 1 là hội thoại đời thường (đặt phòng, đăng ký khóa học, thuê nhà…). Bạn thường điền vào form hoặc ghi chú.</p>
<ul><li><b>Đánh vần:</b> “double S” = SS; nghe kỹ các chữ dễ nhầm như B/V, M/N, A/E/I, G/J.</li>
<li><b>Số:</b> “oh” = 0; người nói hay <b>sửa lại</b> (“It’s 15… sorry, 16”) – đáp án là số sau cùng.</li>
<li><b>Ngày tháng:</b> “16 June” hay “June 16” đều được, nhưng phải đúng chính tả tháng.</li>
<li><b>Giới hạn từ:</b> “NO MORE THAN TWO WORDS AND/OR A NUMBER” – viết thừa 1 từ là sai cả câu. Sai chính tả cũng bị tính sai.</li></ul>
<p>💡 Mẹo: đọc trước câu hỏi trong thời gian cho phép, đoán loại từ cần điền (số? tên? danh từ?), chú ý các từ báo hiệu “actually”, “sorry, I mean”, “no, wait”.</p>`,
    quiz: [['Người nói: “It’s on the 15th… sorry, the 16th of June.” Đáp án?', ['15 June', '16 June', '15/16 June', 'June'], 1, 'Người nói tự sửa – đáp án là thông tin cuối cùng.'],
      ['Yêu cầu “NO MORE THAN TWO WORDS”. Bạn nghe “the city library”. Viết gì?', ['the city library', 'city library', 'library city', 'City Library Centre'], 1, '“the city library” là 3 từ → vượt giới hạn.'],
      ['Khi đánh vần, “double T” nghĩa là?', ['chữ T viết hoa', 'hai chữ T liền nhau', 'chữ T và chữ D', 'bỏ chữ T'], 1, 'double = hai chữ giống nhau liền nhau.'],
      ['Viết sai chính tả một đáp án nghe đúng thì?', ['Vẫn được điểm', 'Được nửa điểm', 'Bị tính sai', 'Tùy giám khảo'], 2, 'Chính tả sai = sai.']] },

  's1-speak-p1': { icon: '🎤', title: 'Speaking Part 1: Trả lời tự nhiên với A-R-E', body: `
<p>Part 1 kéo dài 4–5 phút, giám khảo hỏi về bản thân bạn: nơi ở, công việc/học tập, sở thích, thói quen.</p>
<ul><li>Không trả lời cụt “Yes/No”, cũng không nói quá dài. Mỗi câu nên <b>2–4 câu, khoảng 20–30 giây</b>.</li>
<li>Công thức <b>A-R-E</b>: <b>A</b>nswer (trả lời thẳng) → <b>R</b>eason (lý do) → <b>E</b>xample (ví dụ/chi tiết).</li>
<li>Ví dụ: <i>Do you like reading?</i> → “Yes, quite a lot actually, especially novels. Reading helps me unwind after a long day, and last month I finished a great book about…”</li>
<li>Câu nghĩ thời gian tự nhiên: “Well, …”, “To be honest, …”, “That’s an interesting question…”.</li></ul>
<p>⚠️ Không học thuộc bài mẫu – giám khảo nhận ra ngay. Bạn không cần nói “thật 100%”, điều được chấm là ngôn ngữ.</p>`,
    quiz: [['Câu trả lời tốt nhất cho “Do you like cooking?”', ['Yes.', 'Yes, I do. I like it.', 'Yes, quite a lot actually. It’s a great way to unwind after work, and I usually try a new recipe every weekend.', 'Nói liền 3 phút về lịch sử nấu ăn'], 2, 'Có câu trả lời + lý do + ví dụ, độ dài vừa phải.'],
      ['A-R-E là viết tắt của?', ['Answer – Reason – Example', 'Ask – Repeat – End', 'Answer – Repeat – Explain', 'Agree – Refuse – Explain'], 0, ''],
      ['Part 1 kéo dài khoảng?', ['1–2 phút', '4–5 phút', '10 phút', '15 phút'], 1, ''],
      ['Khi chưa nghĩ ra ý, bạn nên?', ['Im lặng chờ', 'Nói “I don’t know” rồi dừng', 'Dùng câu như “Well, that’s an interesting question…” rồi nói tiếp', 'Xin đổi câu hỏi'], 2, 'Cụm từ nghĩ giúp bạn giữ độ trôi chảy.']] },

  's2-read-skim': { icon: '📖', title: 'Reading: Skimming, Scanning & Trắc nghiệm', body: `
<p>Reading có 60 phút cho 3 bài → khoảng <b>20 phút mỗi bài</b> (bài sau thường khó hơn).</p>
<ul><li><b>Skimming</b> (đọc lướt): đọc tiêu đề, câu đầu mỗi đoạn trong 2–3 phút để nắm bố cục.</li>
<li><b>Scanning</b> (đọc dò): tìm nhanh tên riêng, con số, năm, từ khóa đặc biệt.</li>
<li><b>Multiple choice:</b> đọc câu hỏi trước, gạch từ khóa, tìm đoạn chứa thông tin (câu hỏi thường theo thứ tự bài), rồi đọc kỹ đoạn đó.</li>
<li>Loại đáp án: sai thông tin / đúng nhưng không trả lời câu hỏi / quá tuyệt đối (always, all, never).</li></ul>
<p>💡 Đáp án đúng gần như luôn được <b>diễn đạt lại (paraphrase)</b>; đáp án chép y nguyên từ trong bài thường là bẫy.</p>`,
    quiz: [['Thời gian hợp lý cho mỗi bài đọc?', ['10 phút', '20 phút', '30 phút', '45 phút'], 1, '60 phút ÷ 3 bài.'],
      ['Scanning dùng để?', ['Hiểu ý chính toàn bài', 'Tìm nhanh thông tin cụ thể như số, tên', 'Dịch từng câu', 'Đoán nghĩa từ mới'], 1, ''],
      ['Đáp án trắc nghiệm đúng thường?', ['Chép y nguyên câu trong bài', 'Diễn đạt lại ý trong bài', 'Chứa từ “always”', 'Dài nhất'], 1, ''],
      ['Câu hỏi trắc nghiệm trong Reading thường?', ['Theo thứ tự xuất hiện trong bài', 'Ngẫu nhiên hoàn toàn', 'Luôn ở đoạn cuối', 'Luôn ở đoạn đầu'], 0, '']] },

  's2-read-tfng': { icon: '✅', title: 'Reading: True / False / Not Given', body: `
<ul><li><b>TRUE</b> – bài nói đúng ý đó (thường bằng từ khác).</li>
<li><b>FALSE</b> – bài nói <b>ngược lại</b> ý đó.</li>
<li><b>NOT GIVEN</b> – bài <b>không có thông tin</b> để khẳng định hay phủ định.</li></ul>
<p>Dạng <b>Yes / No / Not Given</b> giống hệt nhưng hỏi về <i>quan điểm của tác giả</i>.</p>
<p>⚠️ Chú ý từ hạn định: some / most / all, may / always, only, more / less. Chỉ dựa vào bài đọc – <b>không dùng hiểu biết bên ngoài</b>.</p>
<p>Ví dụ: Bài “The museum opened in 1990 and attracts about one million visitors a year.”<br>• “The museum opened in the 1990s.” → TRUE • “It receives fewer than 100,000 visitors.” → FALSE • “Entry is free.” → NOT GIVEN.</p>`,
    quiz: [['Bài: “The bridge was completed in 2015 after six years of work.” – Câu: “Building the bridge took six years.”', ['TRUE', 'FALSE', 'NOT GIVEN'], 0, '“six years of work” = mất 6 năm.'],
      ['Cùng bài – Câu: “The bridge was finished before 2010.”', ['TRUE', 'FALSE', 'NOT GIVEN'], 1, 'Hoàn thành năm 2015 → ngược lại.'],
      ['Cùng bài – Câu: “The bridge cost more than planned.”', ['TRUE', 'FALSE', 'NOT GIVEN'], 2, 'Bài không nói gì về chi phí.'],
      ['Nếu bài KHÔNG nhắc đến thông tin trong câu hỏi, đáp án là?', ['TRUE', 'FALSE', 'NOT GIVEN'], 2, '']] },

  's2-listen-map': { icon: '🧭', title: 'Listening Part 2: Bản đồ & trắc nghiệm', body: `
<p>Part 2 là bài độc thoại về một địa điểm hoặc sự kiện (hướng dẫn viên, thông báo…).</p>
<ul><li><b>Bản đồ:</b> trước khi nghe, tìm điểm bắt đầu (“You are here”, entrance) và hướng Bắc.</li>
<li>Ngôn ngữ vị trí: <i>opposite</i> (đối diện), <i>next to</i> (cạnh), <i>between</i> (ở giữa), <i>at the end of</i>, <i>in the corner</i>, <i>go past</i>, <i>turn left/right</i>, <i>straight ahead</i>.</li>
<li><b>Trắc nghiệm:</b> người nói thường nhắc đến TẤT CẢ phương án – nghe kỹ các từ loại trừ: <i>but, however, actually, not any more</i>.</li></ul>`,
    quiz: [['“opposite the café” nghĩa là?', ['Cạnh quán cà phê', 'Đối diện quán cà phê', 'Sau quán cà phê', 'Trong quán'], 1, ''],
      ['Nghe thấy tất cả phương án được nhắc đến. Bạn nên?', ['Chọn cái được nhắc đầu tiên', 'Chú ý “but”, “actually” để biết phương án nào bị loại', 'Chọn cái dài nhất', 'Bỏ trống'], 1, ''],
      ['“between the bank and the library” – vị trí là?', ['Ở giữa ngân hàng và thư viện', 'Sau thư viện', 'Trước ngân hàng', 'Trong ngân hàng'], 0, ''],
      ['Trước khi nghe phần bản đồ, việc đầu tiên nên làm?', ['Tìm điểm bắt đầu và hướng trên bản đồ', 'Đọc transcript', 'Đoán bừa', 'Nhắm mắt nghe'], 0, '']] },

  's2-w1-trend': { icon: '📈', title: 'Writing Task 1: Biểu đồ đường & ngôn ngữ xu hướng', body: `
<p>Bố cục 4 đoạn, ≥150 từ, khoảng 20 phút:</p>
<ol><li><b>Introduction</b> – diễn đạt lại đề bài.</li><li><b>Overview</b> – 2 xu hướng/đặc điểm nổi bật nhất, <b>không đưa số liệu</b>.</li><li><b>Body 1</b> và <b>Body 2</b> – chi tiết, số liệu, so sánh.</li></ol>
<ul><li>Tăng: rise, increase, climb, <i>surge</i> (tăng vọt). Giảm: fall, decline, drop, <i>plummet</i> (giảm mạnh).</li>
<li>Dao động: fluctuate. Ổn định: remain stable, level off. Đỉnh: peak at, reach a peak of.</li>
<li>Mức độ: slightly, gradually, steadily, significantly, sharply, dramatically.</li>
<li>2 cấu trúc: “There was a <b>sharp rise</b> in X” = “X <b>rose sharply</b>”.</li></ul>
<p>⚠️ Không nêu ý kiến cá nhân. Năm đã qua → thì quá khứ; dự đoán → “is expected/projected to”.</p>`,
    quiz: [['Overview trong Task 1 nên?', ['Liệt kê mọi số liệu', 'Nêu xu hướng chính, không cần số liệu', 'Nêu ý kiến cá nhân', 'Bỏ qua'], 1, ''],
      ['“plummet” nghĩa là?', ['Tăng nhẹ', 'Giảm mạnh', 'Dao động', 'Ổn định'], 1, ''],
      ['Câu nào đúng?', ['There was a sharp rise in sales.', 'There was a sharply rise in sales.', 'Sales rose sharp.', 'Sales was rise sharply.'], 0, 'Tính từ + danh từ (a sharp rise) hoặc động từ + trạng từ (rose sharply).'],
      ['Task 1 tối thiểu bao nhiêu từ?', ['100', '150', '250', '300'], 1, '']] },

  's2-speak-p2': { icon: '🗣️', title: 'Speaking Part 2: Cue card trong 1 phút chuẩn bị', body: `
<p>Bạn nhận thẻ chủ đề có 4 gợi ý, được <b>1 phút chuẩn bị</b> (có giấy bút) và nói <b>1–2 phút</b>.</p>
<ul><li>Ghi <b>từ khóa</b> cho từng gợi ý, không viết câu.</li>
<li>Bố cục: câu mở đầu giới thiệu → lần lượt các gợi ý → ý cuối “<i>and explain…</i>” (cảm xúc, lý do) là phần ăn điểm.</li>
<li>Kể chuyện quá khứ → dùng thì quá khứ. Kéo dài bằng chi tiết (ai, ở đâu, khi nào, như thế nào), cảm xúc, so sánh.</li>
<li>Cố gắng nói gần đủ 2 phút; hết ý thì quay lại mô tả chi tiết hơn.</li></ul>`,
    quiz: [['Thời gian chuẩn bị Part 2?', ['10 giây', '1 phút', '3 phút', 'Không có'], 1, ''],
      ['Nên ghi chú như thế nào?', ['Viết cả bài', 'Ghi từ khóa ngắn cho từng gợi ý', 'Không ghi gì', 'Viết câu tiếng Việt'], 1, ''],
      ['Nói bao lâu là lý tưởng?', ['30 giây', 'Gần đủ 2 phút', '5 phút', 'Càng ngắn càng tốt'], 1, ''],
      ['Phần “and explain why…” quan trọng vì?', ['Không quan trọng', 'Thể hiện khả năng giải thích, bày tỏ cảm xúc – ăn điểm', 'Giám khảo không nghe', 'Chỉ cần 1 từ'], 1, '']] },

  's3-read-headings': { icon: '🏷️', title: 'Reading: Matching Headings', body: `
<p>Chọn tiêu đề phù hợp cho mỗi đoạn. Luôn có <b>nhiều tiêu đề hơn số đoạn</b>.</p>
<ul><li>Đọc câu chủ đề (thường câu 1–2) và câu cuối đoạn; tìm <b>ý chính</b>, không phải chi tiết.</li>
<li>Bẫy: tiêu đề chứa từ giống trong đoạn nhưng chỉ nói về một chi tiết nhỏ.</li>
<li>Nên làm dạng này đầu tiên vì giúp hiểu bố cục bài; gạch tiêu đề đã dùng.</li></ul>`,
    quiz: [['Tiêu đề phù hợp cần phản ánh?', ['Một chi tiết nhỏ', 'Ý chính của cả đoạn', 'Từ xuất hiện nhiều nhất', 'Câu cuối bài'], 1, ''],
      ['Đoạn: “Although solar panels were once expensive, prices have fallen by 80% in a decade, making them affordable for many households.” Tiêu đề phù hợp?', ['The history of solar energy', 'Falling costs make solar power accessible', 'How solar panels work', 'The dangers of solar power'], 1, ''],
      ['Bẫy hay gặp?', ['Tiêu đề lặp từ trong đoạn nhưng chỉ nói về chi tiết', 'Tiêu đề quá ngắn', 'Tiêu đề viết hoa', 'Không có bẫy'], 0, ''],
      ['Số tiêu đề so với số đoạn?', ['Ít hơn', 'Bằng', 'Nhiều hơn', 'Luôn ít hơn 2'], 2, '']] },

  's3-read-completion': { icon: '🧩', title: 'Reading: Điền câu & tóm tắt', body: `
<ul><li>Đọc kỹ giới hạn từ (ONE WORD ONLY / NO MORE THAN TWO WORDS…).</li>
<li>Đoán loại từ dựa vào ngữ pháp quanh chỗ trống: danh từ hay động từ? số ít hay số nhiều?</li>
<li>Với sentence completion, từ điền phải lấy <b>đúng nguyên văn</b> trong bài, đúng chính tả. Câu hỏi thường theo thứ tự bài.</li>
<li>Summary completion có danh sách từ cho sẵn: đáp án thường là <b>từ đồng nghĩa</b> với bài.</li></ul>`,
    quiz: [['“The scientists used a ______ to measure temperature.” Chỗ trống cần?', ['Động từ', 'Danh từ số ít', 'Tính từ', 'Trạng từ'], 1, 'Sau “a” cần danh từ số ít.'],
      ['Đề: NO MORE THAN TWO WORDS. Đáp án hợp lệ?', ['the renewable energy', 'renewable energy', 'energy that is renewable', 'renewable energy sources only'], 1, ''],
      ['Từ điền (sentence completion) lấy từ đâu?', ['Từ đồng nghĩa tự nghĩ ra', 'Đúng nguyên văn trong bài', 'Từ trong câu hỏi', 'Bất kỳ từ nào hợp nghĩa'], 1, ''],
      ['“Many cities have introduced ______ to reduce traffic.” Hợp lý nhất?', ['congestion charges', 'reduce', 'expensive', 'quickly'], 0, 'Cần danh từ.']] },

  's3-listen-s3': { icon: '👥', title: 'Listening Part 3: Thảo luận học thuật', body: `
<p>2–4 người (sinh viên, giảng viên) bàn về bài tập hoặc nghiên cứu. Khó vì nhiều giọng và nhiều ý kiến.</p>
<ul><li>Đồng ý: “Exactly”, “That’s a good point”. Phản đối/nghi ngờ: “I’m not so sure”, “Yes, but…”.</li>
<li>Quyết định: “So we’ll go with…”, “Let’s do that”. Đáp án thường là <b>ý được thống nhất cuối cùng</b>.</li>
<li>Xác định ai đang nói – nhiều câu hỏi dạng “Who suggests…?”.</li></ul>`,
    quiz: [['“I’m not so sure about that” thể hiện?', ['Đồng ý', 'Phản đối/nghi ngờ', 'Hỏi thông tin', 'Chào hỏi'], 1, ''],
      ['A đề xuất “interviews”, B: “Good idea, but a questionnaire would reach more people”, A: “You’re right, let’s do that.” Họ chọn?', ['Interviews', 'Questionnaire', 'Cả hai', 'Không chọn'], 1, ''],
      ['Part 3 thường là?', ['Độc thoại về du lịch', 'Thảo luận học thuật', 'Bài giảng', 'Đặt phòng'], 1, ''],
      ['Đáp án trong dạng thảo luận thường là?', ['Ý kiến đầu tiên', 'Quyết định cuối cùng được thống nhất', 'Ý người nói nhiều nhất', 'Ngẫu nhiên'], 1, '']] },

  's3-w2-structure': { icon: '✍️', title: 'Writing Task 2: Bài Opinion 4 đoạn', body: `
<p>≥250 từ, khoảng 40 phút: 5 phút lập dàn ý → 30 phút viết → 5 phút soát lỗi.</p>
<ol><li><b>Mở bài</b>: diễn đạt lại đề + <b>thesis</b> (nêu rõ quan điểm).</li><li><b>Thân bài 1</b>: lý do 1 – câu chủ đề → giải thích → ví dụ.</li><li><b>Thân bài 2</b>: lý do 2 (cùng cấu trúc).</li><li><b>Kết luận</b>: tóm tắt, nhắc lại quan điểm, không thêm ý mới.</li></ol>
<p>Mẫu mở bài: “It is often argued that… I completely agree with this view because… and…”</p>
<p>⚠️ Điểm Task Response mất nhiều nhất khi bạn không trả lời đúng & đủ câu hỏi hoặc quan điểm không rõ.</p>`,
    quiz: [['Thesis statement là?', ['Câu nêu rõ quan điểm trong mở bài', 'Câu ví dụ', 'Câu kết luận', 'Tiêu đề'], 0, ''],
      ['Kết luận nên?', ['Thêm ý mới quan trọng', 'Tóm tắt và nhắc lại quan điểm', 'Hỏi người đọc', 'Kể chuyện cá nhân dài'], 1, ''],
      ['Cấu trúc một đoạn thân bài tốt?', ['Ví dụ → kết luận', 'Câu chủ đề → giải thích → ví dụ', 'Chỉ liệt kê ý', 'Một câu thật dài'], 1, ''],
      ['Nên dành bao lâu lập dàn ý?', ['Không cần', 'Khoảng 5 phút', '20 phút', '30 phút'], 1, '']] },

  's3-speak-p3': { icon: '💬', title: 'Speaking Part 3: Mở rộng câu trả lời', body: `
<p>Câu hỏi trừu tượng về xã hội, liên quan chủ đề Part 2, kéo dài 4–5 phút. Trả lời dài hơn Part 1: <b>3–5 câu</b>.</p>
<ul><li>Công thức: Quan điểm → Lý do → Ví dụ/so sánh → (Mặt trái/hệ quả).</li>
<li>Cụm hữu ích: “I’d say that…”, “One reason is that…”, “For instance…”, “On the other hand…”, “It depends on…”.</li>
<li>So sánh quá khứ – hiện tại – tương lai; dùng ngôn ngữ thận trọng (tend to, generally, it seems that).</li></ul>`,
    quiz: [['Câu trả lời Part 3 nên?', ['1 từ', '3–5 câu có lý do và ví dụ', 'Kể chuyện bản thân dài', 'Đọc bài thuộc lòng'], 1, ''],
      ['Cụm nào dùng để đưa ví dụ?', ['For instance,', 'Goodbye,', 'I don’t know.', 'Yes.'], 0, ''],
      ['Part 3 hỏi về?', ['Thông tin cá nhân', 'Vấn đề xã hội, trừu tượng liên quan Part 2', 'Từ vựng', 'Ngữ pháp'], 1, ''],
      ['“Young people tend to…” là ví dụ của?', ['Hedging – nói giảm, tránh tuyệt đối', 'Câu bị động', 'Câu điều kiện', 'Lỗi sai'], 0, '']] },

  's4-read-matching': { icon: '🔗', title: 'Reading: Matching Information & Features', body: `
<ul><li><b>Matching information</b> (thông tin nằm ở đoạn nào): không theo thứ tự bài, một đoạn có thể dùng nhiều lần → nên làm sau cùng, khi đã hiểu bài.</li>
<li><b>Matching features</b> (nối ý kiến với người/nhóm): scan tên riêng trong bài trước, khoanh vùng, rồi đọc kỹ.</li>
<li>Paraphrase rất mạnh: “a financial benefit” có thể là “saved £2 million”.</li></ul>`,
    quiz: [['Matching information thường?', ['Theo thứ tự bài', 'Không theo thứ tự; một đoạn có thể dùng nhiều lần', 'Mỗi đoạn dùng 1 lần', 'Chỉ ở đoạn đầu'], 1, ''],
      ['Matching features (nối với nhà khoa học), bước đầu tiên?', ['Đọc thật kỹ cả bài', 'Scan tìm tên các nhà khoa học', 'Đoán', 'Đọc câu cuối'], 1, ''],
      ['Nên làm matching information khi nào?', ['Đầu tiên', 'Thường để sau, khi đã hiểu bài', 'Không làm', 'Giữa chừng'], 1, ''],
      ['“a reference to a financial benefit” khớp với đoạn chứa?', ['“the scheme saved the city £2 million”', '“the scheme was popular”', '“the weather was hot”', '“the history of the city”'], 0, '']] },

  's4-listen-s4': { icon: '🎓', title: 'Listening Part 4: Bài giảng & ghi chú', body: `
<p>Một người nói về chủ đề học thuật, thường không có nghỉ giữa phần; dạng phổ biến là điền ghi chú.</p>
<ul><li>Tín hiệu cấu trúc: “First of all”, “Moving on to”, “Another important point”, “In conclusion”.</li>
<li>Đọc trước các tiêu đề trong ghi chú để biết mình đang ở đâu.</li>
<li>Đáp án thường là danh từ; <b>số ít/số nhiều và chính tả</b> phải đúng.</li>
<li>Lỡ một câu → bỏ qua ngay, theo dõi câu tiếp theo.</li></ul>`,
    quiz: [['“Moving on to…” báo hiệu?', ['Kết thúc bài', 'Chuyển sang ý mới', 'Đưa ví dụ', 'Lặp lại'], 1, ''],
      ['Lỡ mất một câu khi nghe, nên?', ['Dừng lại nghĩ', 'Bỏ qua và theo câu tiếp theo', 'Xin nghe lại', 'Bỏ cả phần'], 1, ''],
      ['Part 4 là?', ['Hội thoại 2 người', 'Bài giảng học thuật một người nói', 'Thông báo sân bay', 'Phỏng vấn'], 1, ''],
      ['Viết “factory” khi đáp án là “factories”?', ['Đúng', 'Sai – phải đúng số ít/số nhiều', 'Nửa điểm', 'Tùy giám khảo'], 1, '']] },

  's4-w1-compare': { icon: '📊', title: 'Writing Task 1: Bar, Table, Pie, Process, Map', body: `
<ul><li><b>So sánh:</b> “X was higher than Y”, “the largest proportion”, “twice as much as”, “while/whereas”.</li>
<li><b>Bảng/nhiều số liệu:</b> nhóm số liệu theo điểm chung; không mô tả từng con số.</li>
<li><b>Pie chart:</b> proportion, share, <i>account for</i> (chiếm).</li>
<li><b>Process:</b> thể bị động + từ chỉ trình tự (first, then, after that, finally); overview nêu số bước, điểm bắt đầu – kết thúc.</li>
<li><b>Map:</b> was replaced by, was demolished, was constructed, was expanded; overview nêu thay đổi lớn nhất.</li></ul>`,
    quiz: [['Biểu đồ tròn: “Coal ______ 40% of electricity.”', ['accounted for', 'was accounting', 'increased to', 'rised'], 0, ''],
      ['Mô tả quy trình (process) thường dùng?', ['Bị động + từ chỉ trình tự', 'Câu điều kiện', 'Ý kiến cá nhân', 'Thì tương lai'], 0, ''],
      ['Map: “The trees ______ to build a car park.”', ['were cut down', 'cut down', 'are cutting', 'was cut down'], 0, '“trees” số nhiều, bị động quá khứ.'],
      ['Với bảng nhiều số liệu, nên?', ['Mô tả từng con số', 'Nhóm dữ liệu, nêu điểm nổi bật và so sánh', 'Chép số liệu', 'Bỏ qua bảng'], 1, '']] },

  's4-w2-types': { icon: '🧠', title: 'Writing Task 2: Các dạng đề', body: `
<ol><li><b>Opinion</b> (agree/disagree): nêu rõ mức độ đồng ý ngay từ mở bài.</li>
<li><b>Discussion</b> (discuss both views and give your opinion): mỗi quan điểm một đoạn + ý kiến của bạn.</li>
<li><b>Advantages / Disadvantages</b> (do the advantages outweigh…?): phải nói rõ bên nào lớn hơn nếu đề hỏi.</li>
<li><b>Problem / Cause – Solution</b>: một đoạn nguyên nhân/vấn đề, một đoạn giải pháp tương ứng.</li>
<li><b>Two-part question</b>: trả lời đủ cả hai câu hỏi.</li></ol>
<p>Lỗi nặng nhất: bỏ sót một phần của đề, lạc đề, quan điểm mập mờ.</p>`,
    quiz: [['“Discuss both views and give your own opinion” – bạn cần?', ['Chỉ nêu ý kiến mình', 'Bàn cả hai quan điểm và nêu ý kiến của bạn', 'Chỉ bàn một quan điểm', 'Không cần ý kiến'], 1, ''],
      ['“Do the advantages outweigh the disadvantages?” – bắt buộc?', ['Liệt kê lợi ích', 'Nêu rõ bên nào lớn hơn', 'Không cần kết luận', 'Chỉ nói bất lợi'], 1, ''],
      ['“Why is this happening? What can be done?” là dạng?', ['Opinion', 'Cause – Solution (two-part)', 'Discussion', 'Map'], 1, ''],
      ['Lỗi làm giảm Task Response nhiều nhất?', ['Không trả lời đủ các phần của đề', 'Dùng từ nối', 'Viết 4 đoạn', 'Viết 270 từ'], 0, '']] },

  's4-coherence': { icon: '🧵', title: 'Mạch lạc & liên kết (Coherence & Cohesion)', body: `
<ul><li>Mỗi đoạn <b>một ý chính</b> với câu chủ đề rõ ràng; chia đoạn rõ (dòng trống giữa các đoạn).</li>
<li>Từ nối vừa đủ, đa dạng, đúng nghĩa – không nhồi “Moreover” vào mọi câu.</li>
<li>Tránh lặp từ bằng đại từ và từ thay thế: this, these, such, it, <i>the former / the latter</i>.</li>
<li>Nối ý giữa các câu: “This means that…”, “As a result of this…”.</li></ul>`,
    quiz: [['Cách tránh lặp từ “pollution” nhiều lần?', ['Dùng “this problem”, “it”', 'Viết lại y nguyên', 'Bỏ câu', 'Viết hoa'], 0, ''],
      ['Dùng “Moreover” đầu mọi câu là?', ['Rất tốt', 'Lạm dụng từ nối – bị trừ điểm', 'Bắt buộc', 'Không ảnh hưởng'], 1, ''],
      ['Mỗi đoạn thân bài nên?', ['Nhiều ý không liên quan', 'Tập trung một ý chính với câu chủ đề', 'Chỉ có ví dụ', 'Một câu'], 1, ''],
      ['“the former … the latter” dùng để?', ['Chỉ cái được nhắc trước/sau trong hai thứ', 'Chỉ thời gian', 'Đưa ví dụ', 'Kết luận'], 0, '']] },

  's5-paraphrase': { icon: '🔁', title: 'Kỹ thuật Paraphrase', body: `
<p>Paraphrase = diễn đạt lại cùng một ý. Dùng ở mở bài Writing, và là chìa khóa Reading/Listening (câu hỏi luôn paraphrase bài).</p>
<ol><li>Từ đồng nghĩa: important → crucial, show → illustrate.</li><li>Đổi dạng từ: develop → development.</li><li>Đổi cấu trúc: chủ động ↔ bị động; because → due to.</li><li>Đổi thứ tự ý trong câu.</li></ol>
<p>Giữ nguyên nghĩa và thuật ngữ chuyên môn (không đổi “carbon dioxide”).</p>`,
    quiz: [['Paraphrase tốt của “Many people believe that technology makes life easier.”', ['It is widely believed that technology simplifies our lives.', 'Many people believe technology makes life easy.', 'Technology is bad.', 'People believe many technology.'], 0, ''],
      ['“The government should invest in education” → bị động?', ['Education should be invested in by the government.', 'The government invested education.', 'Education invests government.', 'Government should be education.'], 0, ''],
      ['Từ nào KHÔNG nên đổi khi paraphrase?', ['Thuật ngữ như “carbon dioxide”', 'important', 'many', 'show'], 0, ''],
      ['“because of the rain” ≈ ?', ['due to the rain', 'although the rain', 'in spite rain', 'so rain'], 0, '']] },

  's5-lexical': { icon: '💎', title: 'Lexical Resource: Collocation & từ ít phổ biến', body: `
<p>Band 6.5–7 cần: một số từ ít phổ biến dùng đúng, <b>collocation tự nhiên</b>, ít lỗi chọn từ.</p>
<ul><li>Học từ theo cụm: make a decision, heavy traffic, a strong argument, gain knowledge.</li>
<li>Lỗi hay gặp của người Việt: “do a mistake” (→ make), “learn knowledge” (→ gain/acquire), nhầm <i>economic</i> (thuộc kinh tế) với <i>economical</i> (tiết kiệm).</li>
<li>Không dùng từ “to tát” sai ngữ cảnh – dùng đúng quan trọng hơn dùng khó.</li></ul>`,
    quiz: [['Collocation đúng?', ['make a mistake', 'do a mistake', 'create a mistake', 'build a mistake'], 0, ''],
      ['“gain ______”?', ['knowledge', 'homework', 'informations', 'advices'], 0, ''],
      ['“heavy ______” (collocation tự nhiên)?', ['traffic', 'temperature', 'speed', 'smile'], 0, ''],
      ['“economical” nghĩa là?', ['Tiết kiệm (ít tốn tiền/nhiên liệu)', 'Thuộc về kinh tế', 'Đắt đỏ', 'Giàu có'], 0, '']] },

  's5-grammar-range': { icon: '🏗️', title: 'Ngữ pháp band 6.5: Đa dạng & chính xác', body: `
<p>Band 6.5 cần <b>kết hợp câu đơn và câu phức</b>, và phần lớn câu không có lỗi.</p>
<ul><li>Câu phức: mệnh đề quan hệ, although/while, if, mệnh đề danh từ (“What concerns me is…”).</li>
<li>Lỗi hay mất điểm: chia động từ số ít/nhiều, thiếu mạo từ, sai thì, câu thiếu động từ, câu “chạy” nối 2 mệnh đề bằng dấu phẩy.</li>
<li>Dành 3–5 phút cuối soát lỗi theo danh sách lỗi quen thuộc của riêng bạn.</li></ul>`,
    quiz: [['Câu nào là câu phức?', ['Although it was expensive, the project was successful.', 'The project was successful.', 'It was expensive.', 'Successful project.'], 0, ''],
      ['Lỗi trong “Technology have changed our lives”?', ['have → has', 'Technology → Technologies', 'our → we', 'lives → life'], 0, ''],
      ['“Many people move to cities, they want jobs.” bị lỗi gì?', ['Nối 2 mệnh đề bằng dấu phẩy (run-on)', 'Sai mạo từ', 'Sai thì', 'Không lỗi'], 0, 'Sửa: “…cities because they want jobs.”'],
      ['Band 6.5 ngữ pháp cần?', ['Chỉ câu đơn hoàn hảo', 'Kết hợp câu đơn và câu phức, phần lớn câu không lỗi', 'Toàn câu phức dài', 'Không cần chính xác'], 1, '']] },

  's5-speak-fluency': { icon: '🌊', title: 'Speaking: Trôi chảy & phát âm', body: `
<ul><li><b>Fluency:</b> nói liên tục, dùng cụm từ nghĩ thay vì “uh…”. Tự sửa lỗi nhẹ là bình thường.</li>
<li><b>Phát âm:</b> không cần giọng bản xứ; cần rõ ràng, đúng trọng âm (eCOnomy – ecoNOmic), ngữ điệu, ngắt câu theo cụm nghĩa.</li>
<li>Người Việt hay bỏ <b>âm cuối</b> (-s, -ed, -t, -k) – hãy luyện kỹ.</li>
<li>Luyện: <b>shadowing</b> (nhại theo audio ngay khi nghe), ghi âm và nghe lại, dùng tab Nói của app.</li></ul>`,
    quiz: [['Trọng âm của “economic”?', ['E-co-nom-ic (âm 1)', 'e-CO-nom-ic (âm 2)', 'e-co-NOM-ic (âm 3)', 'e-co-nom-IC (âm 4)'], 2, ''],
      ['Shadowing là?', ['Nhại theo audio ngay khi nghe', 'Đọc thầm', 'Chép lại', 'Dịch sang tiếng Việt'], 0, ''],
      ['Người Việt hay bỏ âm nào?', ['Âm cuối như -s, -ed, -t', 'Âm đầu', 'Nguyên âm', 'Không bỏ âm nào'], 0, ''],
      ['Để điểm phát âm cao, bạn cần?', ['Giọng y hệt người bản xứ', 'Phát âm rõ, trọng âm & ngữ điệu đúng', 'Nói thật nhanh', 'Nói nhỏ'], 1, '']] },

  's5-time': { icon: '⏱️', title: 'Chiến lược thời gian & ngày thi', body: `
<ul><li><b>Listening:</b> tận dụng thời gian đọc trước câu hỏi.</li>
<li><b>Reading:</b> 20 phút/bài, không kẹt quá 2 phút một câu; <b>điền hết đáp án</b> vì sai không bị trừ điểm.</li>
<li><b>Writing:</b> nếu hay thiếu giờ, làm Task 2 trước (gấp đôi điểm): 40 phút Task 2, 20 phút Task 1.</li>
<li><b>Speaking:</b> nói to, rõ; không nghe rõ thì hỏi “Could you repeat the question, please?”.</li>
<li>Ngày trước thi: ôn nhẹ, ngủ đủ, chuẩn bị giấy tờ tùy thân.</li></ul>`,
    quiz: [['Không chắc đáp án Reading, nên?', ['Bỏ trống', 'Vẫn đoán vì sai không bị trừ điểm', 'Viết “không biết”', 'Viết 2 đáp án'], 1, ''],
      ['Nhiều người làm Task 2 trước vì?', ['Task 2 chiếm điểm gấp đôi', 'Task 2 ngắn hơn', 'Bắt buộc', 'Không lý do'], 0, ''],
      ['Không nghe rõ câu hỏi Speaking?', ['Đoán đại', 'Lịch sự hỏi lại', 'Im lặng', 'Nói tiếng Việt'], 1, ''],
      ['Một câu Reading quá khó, nên?', ['Dành 10 phút', 'Đánh dấu, làm tiếp, quay lại sau', 'Bỏ cả bài', 'Nộp bài'], 1, '']] }
};

/* ---------- 5 chặng (dễ → khó). Node: L=bài kỹ năng, V=gói từ (pack hoặc topic), G=ngữ pháp, B=boss, M=thi thử ---------- */
const STAGES = [
  { id: 1, name: 'Nền tảng', band: '4.5', color: '#58cc02', emoji: '🌱', desc: 'Hiểu đề thi, ngữ pháp cơ bản, từ vựng chủ đề quen thuộc, Listening Part 1, Speaking Part 1.',
    nodes: ['L:s1-format', 'V:daily', 'G:Mạo từ', 'V:family', 'L:s1-listen-form', 'G:Danh từ đếm được', 'V:hometown', 'G:Hòa hợp chủ–vị', 'L:s1-speak-p1', 'V:studywork', 'G:Thì động từ', 'G:Giới từ', 'B:1'] },
  { id: 2, name: 'Tăng tốc', band: '5.0', color: '#1cb0f6', emoji: '🚀', desc: 'Kỹ thuật đọc, True/False/Not Given, bản đồ Listening, Task 1 xu hướng, Part 2, AWL 1.',
    nodes: ['L:s2-read-skim', 'V:awl1a', 'G:So sánh', 'L:s2-read-tfng', 'V:awl1b', 'G:To-V / V-ing', 'L:s2-listen-map', 'V:awl1c', 'T:Health', 'L:s2-w1-trend', 'G:Câu bị động', 'V:awl1d', 'T:Education', 'L:s2-speak-p2', 'B:2'] },
  { id: 3, name: 'Bứt phá', band: '5.5', color: '#ce82ff', emoji: '⚡', desc: 'Matching headings, điền câu, Listening Part 3, bài luận Opinion, Speaking Part 3, AWL 2.',
    nodes: ['L:s3-read-headings', 'V:awl2a', 'G:Câu điều kiện', 'L:s3-read-completion', 'V:awl2b', 'T:Environment', 'L:s3-listen-s3', 'G:Mệnh đề quan hệ', 'V:awl2c', 'L:s3-w2-structure', 'G:Từ nối', 'V:awl2d', 'T:Technology', 'L:s3-speak-p3', 'B:3'] },
  { id: 4, name: 'Chinh phục', band: '6.0', color: '#ff9600', emoji: '🏔️', desc: 'Matching information, bài giảng Part 4, Task 1 đủ dạng, Task 2 đủ dạng, mạch lạc, AWL 3.',
    nodes: ['L:s4-read-matching', 'V:awl3a', 'G:Dạng từ', 'L:s4-listen-s4', 'V:awl3b', 'T:Society', 'L:s4-w1-compare', 'V:awl3c', 'G:Hedging & Modal', 'L:s4-w2-types', 'V:awl3d', 'T:Work', 'L:s4-coherence', 'B:4'] },
  { id: 5, name: 'Đích 6.5', band: '6.5', color: '#ff4b4b', emoji: '🏆', desc: 'Paraphrase, từ vựng & ngữ pháp band 6.5+, trôi chảy, chiến lược phòng thi, thi thử đầy đủ.',
    nodes: ['L:s5-paraphrase', 'V:colloc', 'L:s5-lexical', 'T:Task 1', 'L:s5-grammar-range', 'T:Academic', 'L:s5-speak-fluency', 'L:s5-time', 'M:full', 'B:5'] }
];

/* ---------- Tài liệu tham khảo ---------- */
const RESOURCES = [
  { stage: 'Mọi chặng', name: 'Cambridge IELTS Academic (bộ sách đề thi thật, số càng lớn càng mới)', by: 'Cambridge University Press & Assessment', use: 'Đề thi thật có đáp án và audio – dùng làm đề thi thử từ chặng 3 trở đi; để dành các cuốn mới nhất cho 1–2 tháng cuối.', paid: true },
  { stage: 'Chặng 1–5', name: 'The Official Cambridge Guide to IELTS', by: 'Pauline Cullen, Amanda French, Vanessa Jakeman', use: 'Giáo trình tổng hợp chính thức: giải thích từng dạng câu hỏi, kỹ năng, kèm đề luyện.', paid: true },
  { stage: 'Chặng 1–2', name: 'Complete IELTS Bands 4–5 / Bands 5–6.5', by: 'Cambridge', use: 'Giáo trình theo cấp độ, đi từ dễ đến khó – hợp với người mất gốc đến 6.5.', paid: true },
  { stage: 'Chặng 1–3', name: 'English Grammar in Use (Intermediate)', by: 'Raymond Murphy', use: 'Củng cố ngữ pháp nền tảng, mỗi bài 2 trang lý thuyết – bài tập.', paid: true },
  { stage: 'Chặng 2–4', name: 'IELTS Vocabulary (up to Band 6.0 → for Bands 6.5 and above)', by: 'Pauline Cullen – Cambridge', use: 'Từ vựng theo chủ đề và kỹ năng IELTS; cuốn 6.5+ dùng ở chặng 4–5.', paid: true },
  { stage: 'Chặng 3–5', name: 'IELTS Grammar for Bands 6.5 and above (trước đây: Cambridge Grammar for IELTS)', by: 'Diana Hopkins, Pauline Cullen – Cambridge', use: 'Ngữ pháp gắn với từng kỹ năng IELTS.', paid: true },
  { stage: 'Chặng 2–5', name: 'Collins English for IELTS: Listening / Reading / Writing / Speaking / Vocabulary / Grammar', by: 'HarperCollins', use: 'Mỗi cuốn tập trung 1 kỹ năng – chọn cuốn cho kỹ năng yếu nhất.', paid: true },
  { stage: 'Chặng 4–5', name: 'English Collocations in Use (Intermediate)', by: 'Michael McCarthy, Felicity O’Dell', use: 'Collocation tự nhiên – nâng điểm Lexical Resource.', paid: true },
  { stage: 'Mọi chặng', name: 'Đề mẫu miễn phí chính thức – IELTS.org', by: 'IELTS (British Council, IDP, Cambridge)', url: 'https://ielts.org/take-a-test/preparation-resources', use: 'Đề mẫu từng kỹ năng có đáp án.', paid: false },
  { stage: 'Mọi chặng', name: 'British Council – Free practice tests', by: 'British Council', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests', use: 'Bài luyện Listening/Reading/Writing/Speaking miễn phí, có đáp án.', paid: false },
  { stage: 'Mọi chặng', name: 'IDP IELTS Việt Nam – Chuẩn bị', by: 'IDP', url: 'https://ielts.idp.com/vietnam/prepare', use: 'Đề luyện, bài viết hướng dẫn tiếng Việt/Anh.', paid: false },
  { stage: 'Mọi chặng', name: 'British Council – Test format', by: 'British Council', url: 'https://takeielts.britishcouncil.org/take-ielts/test-format', use: 'Mô tả định dạng đề chính thức.', paid: false },
  { stage: 'Chặng 1–3', name: 'LearnEnglish – British Council', by: 'British Council', url: 'https://learnenglish.britishcouncil.org', use: 'Ngữ pháp, từ vựng, nghe – đọc theo cấp độ, miễn phí.', paid: false },
  { stage: 'Chặng 1–5', name: 'BBC Learning English (6 Minute English)', by: 'BBC', url: 'https://www.bbc.co.uk/learningenglish', use: 'Luyện nghe hằng ngày 6 phút, có transcript.', paid: false },
  { stage: 'Chặng 2–5', name: 'Academic Word List (AWL)', by: 'Averil Coxhead (2000), Victoria University of Wellington', use: '570 họ từ học thuật hay gặp nhất – app đã đưa sublist 1–3 vào lộ trình.', paid: false }
];
