# ATS Recruitment System

Hệ thống quản lý tuyển dụng nội bộ (ATS) - MVP.

## Kiến trúc
- Frontend: React + TypeScript + Vite
- Backend: Spring Boot 3 + Java 17
- Database: PostgreSQL
- Auth: JWT-ready structure (MVP dùng demo auth trước)
- API: REST, server riêng tại `http://localhost:8080`
- Frontend: `http://localhost:5173`

## Chạy nhanh bằng Docker
```powershell
docker compose up --build
```
Sau đó mở:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/health
- PostgreSQL: localhost:5432

## Chạy thủ công
### Backend
Yêu cầu Java 17+ và Maven.
```powershell
cd backend
mvn spring-boot:run
```

### Frontend
Yêu cầu Node.js 20+.
```powershell
cd frontend
npm install
npm run dev
```

## API chính
- GET `/api/health`
- GET `/api/jobs`
- POST `/api/jobs`
- GET `/api/candidates`
- POST `/api/candidates`
- GET `/api/applications`
- PATCH `/api/applications/{id}/stage`
- POST `/api/interviews`
- POST `/api/evaluations`

Thiết kế này bám phạm vi tài liệu: quản lý người dùng, vị trí, ứng viên, pipeline, phỏng vấn, đánh giá và offer/onboarding sẽ được mở rộng theo sprint. 
