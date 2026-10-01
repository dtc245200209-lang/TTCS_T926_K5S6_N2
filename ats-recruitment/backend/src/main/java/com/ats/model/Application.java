package com.ats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="applications")
public class Application {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) private Job job;
    @ManyToOne(optional=false) private Candidate candidate;
    @Enumerated(EnumType.STRING) private ApplicationStage stage = ApplicationStage.NEW;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Application() {}
    public Application(Job job,Candidate candidate){this.job=job;this.candidate=candidate;}
    public Long getId(){return id;}
    public Job getJob(){return job;}
    public Candidate getCandidate(){return candidate;}
    public ApplicationStage getStage(){return stage;}
    public void setStage(ApplicationStage s){stage=s;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
