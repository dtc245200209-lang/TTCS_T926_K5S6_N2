# TTCS_T926_K5S6_N2
#  HỆ THỐNG TUYỂN DỤNG NỘI BỘ (ATS - APPLICANT TRACKING SYSTEM)
> **Thực tập Cơ sở | Nhóm 2 | Lớp T926_K5S6**  
> **Thời gian thực hiện:** 8 tuần (8 Sprints) | **Quy mô:** 76 User Stories — 350 Story Points

---

##  1. Giới thiệu dự án (Project Overview)

Hiện nay, bộ phận nhân sự tại nhiều doanh nghiệp vẫn thực hiện tuyển dụng thủ công qua Excel, Gmail và Google Drive. Điều này dẫn đến việc thất lạc CV, không theo dõi được tiến độ tuyển dụng, thiếu minh bạch trong phê duyệt headcount/lương và thiếu sự nhất quán trong đánh giá ứng viên.

**Hệ thống Tuyển dụng Nội bộ (ATS)** là giải pháp phần mềm trên nền tảng Web giúp doanh nghiệp quản lý trọn vẹn vòng đời tuyển dụng trên một hệ thống tập trung — từ khi phát sinh Yêu cầu tuyển dụng (Requisition), Phê duyệt, Đăng tin, Tiếp nhận CV, Phỏng vấn, Đánh giá, cho đến Đề xuất Offer và Onboarding.

###  Mục tiêu & Thước đo thành công
- **Quy trình chuẩn hóa:** Run thành công 1 vị trí tuyển dụng thực tế đi qua toàn bộ chu trình (Yêu cầu ➔ Duyệt ➔ Đăng tin ➔ Ứng tuyển ➔ Phỏng vấn ➔ Offer ➔ Onboarding).
- **Tối ưu thời gian sàng lọc:** Hỗ trợ Recruiter xử lý 20 CV mới trong $\le$ 15 phút nhờ bảng điều phối Pipeline (Kanban) và các nhãn đánh dấu.
- **Minh bạch & Lưu vết (Audit Trail):** 100% Yêu cầu tuyển dụng và Offer đều có lịch sử phê duyệt chi tiết theo phân cấp.
- **Đánh giá khách quan:** 100% ứng viên vòng cuối có tối thiểu 2 phiếu đánh giá chuẩn hóa theo Khung năng lực.

---

## 🛠️ 2. Nền tảng Kỹ thuật (Tech Stack)

| Tầng (Layer) | Công nghệ / Công cụ | Mô tả & Lý do lựa chọn |
| :--- | :--- | :--- |
| **Frontend** | `React` + `TypeScript` | Giao diện Responsive, tối ưu UX cho cả Desktop và Mobile |
| **Backend** | `Spring Boot` (Java) / `NestJS` | Xử lý logic nghiệp vụ chặt chẽ, hỗ trợ RESTful API |
| **Database** | `PostgreSQL` | Đảm bảo tính toàn vẹn dữ liệu và ràng buộc mối quan hệ chặt chẽ |
| **Authentication** | `JWT` (Access + Refresh Token) | Xác thực an toàn, phân quyền theo từng vai trò nghiệp vụ |
| **Storage** | Object Storage (S3 / Cloud Storage) | Quản lý và lưu trữ tệp CV (PDF/Docx) của ứng viên |
| **Notification** | `SMTP` Nội bộ + Message Queue | Gửi email thông báo, thư mời phỏng vấn & kết quả tự động |

---

## 👥 3. Các Vai trò Người dùng (7 User Roles)

1. **Candidate (Ứng viên):** Tìm kiếm vị trí, nộp CV, tra cứu trạng thái hồ sơ và phản hồi Offer.
2. **Recruiter (Nhân viên tuyển dụng):** Sàng lọc CV, điều phối Pipeline Kanban, đặt lịch phỏng vấn, tạo Offer.
3. **Hiring Manager (Trưởng bộ phận):** Tạo yêu cầu tuyển dụng (Requisition), duyệt CV chuyên môn, đánh giá phỏng vấn.
4. **Interviewer (Người phỏng vấn):** Xem lịch phỏng vấn, tra cứu CV và điền phiếu đánh giá theo khung năng lực.
5. **HR Manager (Trưởng phòng Nhân sự):** Phân công công việc, quản lý ngân sách Headcount, theo dõi báo cáo & dashboard.
6. **Approver (Người duyệt):** Phê duyệt các yêu cầu tuyển dụng và đề xuất Offer vượt dải lương.
7. **Admin (Quản trị hệ thống):** Quản lý tài khoản, phân quyền vai trò, quản lý danh mục dùng chung và theo dõi Audit Log.

---

##  4. Các Nhóm Chức năng Chính (9 Epics)

* **EP-01: Tài khoản & Phân quyền (13 Stories / 52 Points):** Đăng nhập, đổi/khôi phục mật khẩu, phân quyền 7 vai trò, quản lý hồ sơ cá nhân.
* **EP-02: Danh mục Tổ chức & Vị trí (5 Stories / 25 Points):** Cơ cấu phòng ban, chức danh, dải lương, khung năng lực và ngân hàng câu hỏi.
* **EP-03: Yêu cầu Tuyển dụng & Phê duyệt (9 Stories / 44 Points):** Tạo Requisition, luồng duyệt đa cấp, quản lý ngân sách headcount.
* **EP-04: Đăng tin & Cổng Ứng tuyển (11 Stories / 47 Points):** Trang việc làm Public, nộp CV trực tuyến, tra cứu hồ sơ bằng mã.
* **EP-05: Hồ sơ Ứng viên & Pipeline (11 Stories / 53 Points):** Bảng Kanban điều phối ứng viên, lọc/tìm kiếm CV, phát hiện trùng lặp.
* **EP-06: Phỏng vấn & Đánh giá (11 Stories / 51 Points):** Lên lịch phỏng vấn, thư mời tự động, phiếu đánh giá năng lực, so sánh ứng viên.
* **EP-07: Offer & Onboarding (5 Stories / 28 Points):** Soạn offer, duyệt offer theo hạn mức, thư mời nhận việc, checklist ngày đầu.
* **EP-08: Thông báo & Email Tự động (6 Stories / 22 Points):** Mẫu email theo giai đoạn, thư từ chối hàng loạt, thông báo hệ thống.
* **EP-09: Báo cáo & Dashboard (5 Stories / 28 Points):** Dashboard tổng quan, báo cáo phễu tuyển dụng, thời gian tuyển dụng (Time-to-hire).

---

##  5. Lộ trình Phát triển (8-Sprint Roadmap)

| Sprint | Chủ đề Sprint | Mục tiêu Demo (Definition of Done) | Velocity |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Tài khoản & Phân quyền | 7 vai trò đăng nhập thành công, kiểm soát quyền truy cập theo vai trò. | 42 pts |
| **Sprint 2** | Danh mục & Yêu cầu | Quản lý sơ đồ tổ chức, khung năng lực và tạo Yêu cầu tuyển dụng đầu tiên. | 45 pts |
| **Sprint 3** | Phê duyệt & Đăng tin | Requisition đi qua luồng duyệt ➔ Xuất bản thành tin tuyển dụng công khai. | 44 pts |
| **Sprint 4** | Cổng Ứng tuyển | Cổng tuyển dụng public: Ứng viên nộp CV thành công trên di động & tra cứu. | 45 pts |
| **Sprint 5** | Pipeline & Quản lý CV | Recruiter điều phối ứng viên trên bảng Kanban qua các giai đoạn. | 45 pts |
| **Sprint 6** | Phỏng vấn & Đánh giá | Lập lịch phỏng vấn, tự động gửi mail mời và hoàn thành phiếu đánh giá. | 43 pts |
| **Sprint 7** | Offer & Onboarding | Tạo & duyệt Offer, gửi thư mời làm việc và theo dõi ứng viên chấp nhận. | 42 pts |
| **Sprint 8** | Báo cáo & Bàn giao | Dashboard phân tích phễu tuyển dụng, time-to-hire, nghiệm thu dự án. | 44 pts |

---

##  6. Hướng dẫn Cài đặt & Chạy Dự án (Getting Started)

### Yêu cầu môi trường
- **Node.js** (v18+)
- **Java JDK** (v17+) hoặc **Node.js** (cho Backend NestJS)
- **PostgreSQL** (v14+)
- **Git**

### Các bước khởi chạy

1. **Clone repository về máy:**
   ```bash
   git clone [https://github.com/dtc245200209-lang/TTCS_T926_K5S6_N2.git](https://github.com/dtc245200209-lang/TTCS_T926_K5S6_N2.git)
   cd TTCS_T926_K5S6_N2
