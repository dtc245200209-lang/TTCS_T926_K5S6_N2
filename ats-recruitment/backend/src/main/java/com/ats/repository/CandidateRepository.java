package com.ats.repository;
import com.ats.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CandidateRepository extends JpaRepository<Candidate,Long> {}
