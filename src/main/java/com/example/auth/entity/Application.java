package com.example.auth.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne @JoinColumn(name = "candidate_profile_id")
    private CandidateProfile candidateProfile;
    
    @ManyToOne @JoinColumn(name = "job_request_id")
    private JobRequest jobRequest;
    
    @Column(length = 50)
    private String status; // APPLIED, SCREENING, INTERVIEWING, OFFERING, HIRED, REJECTED
    
    @Column(name = "applied_at")
    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();
}
