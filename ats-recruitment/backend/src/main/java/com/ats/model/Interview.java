package com.ats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="interviews")
public class Interview {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) private Application application;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String interviewer;
    private String meetingUrl;
    private String status = "SCHEDULED";

    public Interview(){}
    public Long getId(){return id;}
    public Application getApplication(){return application;}
    public void setApplication(Application v){application=v;}
    public LocalDateTime getStartAt(){return startAt;}
    public void setStartAt(LocalDateTime v){startAt=v;}
    public LocalDateTime getEndAt(){return endAt;}
    public void setEndAt(LocalDateTime v){endAt=v;}
    public String getInterviewer(){return interviewer;}
    public void setInterviewer(String v){interviewer=v;}
    public String getMeetingUrl(){return meetingUrl;}
    public void setMeetingUrl(String v){meetingUrl=v;}
    public String getStatus(){return status;}
}
