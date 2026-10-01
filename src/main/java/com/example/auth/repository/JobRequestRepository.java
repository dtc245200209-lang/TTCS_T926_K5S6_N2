package com.example.auth.repository;

import com.example.auth.entity.JobRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRequestRepository extends JpaRepository<JobRequest, Long> {
    List<JobRequest> findByStatus(String status);
    List<JobRequest> findByHiringManagerId(Long hiringManagerId);
    List<JobRequest> findByDepartmentId(Long departmentId);
}
