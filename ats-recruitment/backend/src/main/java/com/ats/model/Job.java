package com.ats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false) private String title;
    private String department;
    private String location;
    private String salaryRange;
    @Enumerated(EnumType.STRING) private JobStatus status = JobStatus.DRAFT;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Job() {}
    public Job(String title, String department, String location, String salaryRange) {
        this.title=title; this.department=department; this.location=location; this.salaryRange=salaryRange;
    }
    public Long getId(){return id;}
    public String getTitle(){return title;}
    public void setTitle(String v){title=v;}
    public String getDepartment(){return department;}
    public void setDepartment(String v){department=v;}
    public String getLocation(){return location;}
    public void setLocation(String v){location=v;}
    public String getSalaryRange(){return salaryRange;}
    public void setSalaryRange(String v){salaryRange=v;}
    public JobStatus getStatus(){return status;}
    public void setStatus(JobStatus v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
