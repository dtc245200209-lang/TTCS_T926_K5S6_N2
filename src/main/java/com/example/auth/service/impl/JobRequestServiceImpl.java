package com.example.auth.service.impl;

import com.example.auth.dto.JobRequestDto;
import com.example.auth.entity.Department;
import com.example.auth.entity.JobRequest;
import com.example.auth.entity.User;
import com.example.auth.exception.AppException;
import com.example.auth.repository.DepartmentRepository;
import com.example.auth.repository.JobRequestRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.service.JobRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobRequestServiceImpl implements JobRequestService {

    private final JobRequestRepository jobRequestRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public JobRequestDto createJobRequest(JobRequestDto dto, String username) {
        User hiringManager = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại"));

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElse(null);
        }
        
        User recruiter = null;
        if (dto.getRecruiterId() != null) {
             recruiter = userRepository.findById(dto.getRecruiterId()).orElse(null);
        }

        JobRequest jobRequest = JobRequest.builder()
                .title(dto.getTitle())
                .headcount(dto.getHeadcount())
                .minSalary(dto.getMinSalary())
                .maxSalary(dto.getMaxSalary())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .department(department)
                .hiringManager(hiringManager)
                .recruiter(recruiter)
                .createdAt(LocalDateTime.now())
                .status("PENDING_APPROVAL")
                .build();

        JobRequest saved = jobRequestRepository.save(jobRequest);
        return mapToDto(saved);
    }

    @Override
    public List<JobRequestDto> getAllJobRequests() {
        return jobRequestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobRequestDto> getJobRequestsByDepartment(Long departmentId) {
        return jobRequestRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public JobRequestDto approveOrReject(Long id, boolean isApproved, String approverUsername) {
        JobRequest jobRequest = jobRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Yêu cầu không tồn tại"));

        if (isApproved) {
            jobRequest.setStatus("APPROVED");
        } else {
            jobRequest.setStatus("REJECTED");
        }
        
        JobRequest updated = jobRequestRepository.save(jobRequest);
        return mapToDto(updated);
    }

    private JobRequestDto mapToDto(JobRequest entity) {
        return JobRequestDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .headcount(entity.getHeadcount())
                .minSalary(entity.getMinSalary())
                .maxSalary(entity.getMaxSalary())
                .description(entity.getDescription())
                .requirements(entity.getRequirements())
                .status(entity.getStatus())
                .departmentId(entity.getDepartment() != null ? entity.getDepartment().getId() : null)
                .hiringManagerId(entity.getHiringManager() != null ? entity.getHiringManager().getId() : null)
                .hiringManagerName(entity.getHiringManager() != null ? entity.getHiringManager().getUsername() : null)
                .recruiterId(entity.getRecruiter() != null ? entity.getRecruiter().getId() : null)
                .recruiterName(entity.getRecruiter() != null ? entity.getRecruiter().getUsername() : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Override
    public JobRequestDto assignRecruiter(Long id, String recruiterUsername) {
        JobRequest job = jobRequestRepository.findById(id)
                .orElseThrow(() -> new com.example.auth.exception.AppException("Không tìm thấy Yêu cầu tuyển dụng này"));
        
        User recruiter = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new com.example.auth.exception.AppException("Không tìm thấy Recruiter này"));
                
        job.setRecruiter(recruiter);
        job.setStatus("OPEN");
        JobRequest saved = jobRequestRepository.save(job);
        return mapToDto(saved);
    }
}
