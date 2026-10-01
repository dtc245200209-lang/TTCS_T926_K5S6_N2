package com.example.auth.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
