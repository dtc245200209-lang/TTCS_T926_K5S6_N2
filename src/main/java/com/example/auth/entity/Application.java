package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "job_applications", uniqueConstraints = @UniqueConstraint(columnNames = {"candidate_id", "job_id"}))
@Getter @Setter @NoArgsConstructor
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) @JoinColumn(name = "candidate_id") private Candidate candidate;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) @JoinColumn(name = "job_id") private JobOpening job;
    @Column(nullable = false) private String stage = "NEW";
    @Column(nullable = false) private LocalDateTime appliedAt = LocalDateTime.now();
}
