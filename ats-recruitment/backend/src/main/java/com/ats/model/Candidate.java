package com.ats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="candidates")
public class Candidate {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false) private String fullName;
    @Column(nullable=false) private String email;
    private String phone;
    private String cvUrl;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Candidate() {}
    public Candidate(String fullName,String email,String phone,String cvUrl){
        this.fullName=fullName;this.email=email;this.phone=phone;this.cvUrl=cvUrl;
    }
    public Long getId(){return id;}
    public String getFullName(){return fullName;}
    public void setFullName(String v){fullName=v;}
    public String getEmail(){return email;}
    public void setEmail(String v){email=v;}
    public String getPhone(){return phone;}
    public void setPhone(String v){phone=v;}
    public String getCvUrl(){return cvUrl;}
    public void setCvUrl(String v){cvUrl=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
