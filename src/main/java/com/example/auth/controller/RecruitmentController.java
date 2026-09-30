package com.example.auth.controller;

import com.example.auth.dto.ApiResponse;
import com.example.auth.entity.Application;
import com.example.auth.entity.Candidate;
import com.example.auth.entity.JobOpening;
import com.example.auth.exception.AppException;
import com.example.auth.repository.ApplicationRepository;
import com.example.auth.repository.CandidateRepository;
import com.example.auth.repository.JobOpeningRepository;
import com.example.auth.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecruitmentController {
    private static final Set<String> STAGES = Set.of("NEW", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED");

    private final JobOpeningRepository jobs;
    private final CandidateRepository candidates;
    private final ApplicationRepository applications;
    private final UserRepository users;

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobOpening>>> listJobs() {
        return ResponseEntity.ok(ApiResponse.success("Danh sách vị trí tuyển dụng", jobs.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<ApplicationView>>> myApplications(Authentication authentication) {
        var user = users.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản nhân viên"));
        if (user.getEmail() == null || user.getEmail().isBlank())
            throw new AppException("Tài khoản chưa có email. Hãy liên hệ quản trị viên để cập nhật hồ sơ.");
        var result = applications.findByCandidate_EmailIgnoreCaseOrderByAppliedAtDesc(user.getEmail()).stream()
                .map(ApplicationView::from).toList();
        return ResponseEntity.ok(ApiResponse.success("Danh sách hồ sơ ứng tuyển của bạn", result));
    }

    @PostMapping("/jobs/{jobId}/apply")
    @Transactional
    public ResponseEntity<ApiResponse<ApplicationView>> applyToJob(@PathVariable Long jobId, Authentication authentication) {
        var user = users.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản nhân viên"));
        if (user.getEmail() == null || user.getEmail().isBlank())
            throw new AppException("Tài khoản chưa có email. Hãy liên hệ quản trị viên để cập nhật hồ sơ.");
        JobOpening job = jobs.findById(jobId).orElseThrow(() -> new AppException("Không tìm thấy vị trí tuyển dụng"));
        if (!"OPEN".equalsIgnoreCase(job.getStatus())) throw new AppException("Vị trí tuyển dụng này đã đóng");

        String email = user.getEmail().trim().toLowerCase();
        Candidate candidate = candidates.findByEmailIgnoreCase(email).orElseGet(() -> {
            Candidate created = new Candidate();
            created.setFullName(user.getUsername());
            created.setEmail(email);
            created.setSource("Ứng tuyển nội bộ");
            return candidates.save(created);
        });
        if (applications.existsByCandidate_IdAndJob_Id(candidate.getId(), job.getId()))
            throw new AppException("Bạn đã ứng tuyển vị trí này rồi");

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        return ResponseEntity.ok(ApiResponse.success("Ứng tuyển thành công", ApplicationView.from(applications.save(application))));
    }

    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobOpening>> createJob(@Valid @RequestBody JobRequest request) {
        JobOpening job = new JobOpening();
        job.setTitle(request.title().trim());
        job.setDepartment(request.department().trim());
        job.setHeadcount(request.headcount());
        job.setDescription(request.description() == null ? "" : request.description().trim());
        return ResponseEntity.ok(ApiResponse.success("Đã tạo vị trí tuyển dụng", jobs.save(job)));
    }

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse<List<Candidate>>> listCandidates() {
        return ResponseEntity.ok(ApiResponse.success("Danh sách ứng viên", candidates.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @PostMapping("/candidates")
    public ResponseEntity<ApiResponse<Candidate>> createCandidate(@Valid @RequestBody CandidateRequest request) {
        String email = request.email().trim().toLowerCase();
        if (candidates.findByEmailIgnoreCase(email).isPresent()) throw new AppException("Email ứng viên đã tồn tại");
        Candidate candidate = new Candidate();
        candidate.setFullName(request.fullName().trim());
        candidate.setEmail(email);
        candidate.setPhone(request.phone() == null ? "" : request.phone().trim());
        candidate.setSource(request.source() == null || request.source().isBlank() ? "Trực tiếp" : request.source().trim());
        return ResponseEntity.ok(ApiResponse.success("Đã tạo hồ sơ ứng viên", candidates.save(candidate)));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<ApplicationView>>> listApplications() {
        var result = applications.findAll(Sort.by(Sort.Direction.DESC, "appliedAt")).stream()
                .map(ApplicationView::from).toList();
        return ResponseEntity.ok(ApiResponse.success("Danh sách hồ sơ ứng tuyển", result));
    }

    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<ApplicationView>> createApplication(@Valid @RequestBody ApplicationRequest request) {
        Candidate candidate = candidates.findById(request.candidateId())
                .orElseThrow(() -> new AppException("Không tìm thấy ứng viên"));
        JobOpening job = jobs.findById(request.jobId())
                .orElseThrow(() -> new AppException("Không tìm thấy vị trí tuyển dụng"));
        if (applications.existsByCandidate_IdAndJob_Id(candidate.getId(), job.getId()))
            throw new AppException("Ứng viên đã được thêm vào quy trình của vị trí này");
        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm ứng viên vào quy trình tuyển dụng", ApplicationView.from(applications.save(application))));
    }

    @PatchMapping("/applications/{id}/stage")
    public ResponseEntity<ApiResponse<ApplicationView>> changeStage(@PathVariable Long id, @Valid @RequestBody StageRequest request) {
        String stage = request.stage().trim().toUpperCase();
        if (!STAGES.contains(stage)) throw new AppException("Trạng thái quy trình không hợp lệ");
        Application application = applications.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ ứng tuyển"));
        application.setStage(stage);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giai đoạn tuyển dụng", ApplicationView.from(applications.save(application))));
    }

    public record JobRequest(@NotBlank @Size(max=160) String title, @NotBlank @Size(max=120) String department,
                             @Min(1) int headcount, @Size(max=4000) String description) {}
    public record CandidateRequest(@NotBlank @Size(max=160) String fullName, @NotBlank @Email @Size(max=254) String email,
                                   @Size(max=40) String phone, @Size(max=100) String source) {}
    public record ApplicationRequest(@NotNull Long candidateId, @NotNull Long jobId) {}
    public record StageRequest(@NotBlank String stage) {}
    public record ApplicationView(Long id, Long candidateId, String candidateName, String candidateEmail,
                                  Long jobId, String jobTitle, String department, String stage, java.time.LocalDateTime appliedAt) {
        static ApplicationView from(Application a) {
            return new ApplicationView(a.getId(), a.getCandidate().getId(), a.getCandidate().getFullName(), a.getCandidate().getEmail(),
                    a.getJob().getId(), a.getJob().getTitle(), a.getJob().getDepartment(), a.getStage(), a.getAppliedAt());
        }
    }
}
