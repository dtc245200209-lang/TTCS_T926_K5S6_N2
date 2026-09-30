package com.example.auth.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Offer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne @JoinColumn(name = "application_id")
    private Application application;
    
    private Double offeredSalary;
    private LocalDateTime expectedStartDate;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(length = 50)
    private String status; // PENDING_APPROVAL, APPROVED, SENT, ACCEPTED, DECLINED
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
