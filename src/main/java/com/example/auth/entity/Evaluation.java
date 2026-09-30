package com.example.auth.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne @JoinColumn(name = "interview_id")
    private Interview interview;
    
    private Integer score; // 1 to 10
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(length = 50)
    private String recommendedAction; // HIRE, REJECT, NEXT_ROUND
    
    @Column(name = "evaluated_at")
    @Builder.Default
    private LocalDateTime evaluatedAt = LocalDateTime.now();
}
