package com.ats.repository;
import com.ats.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JobRepository extends JpaRepository<Job,Long> {}
