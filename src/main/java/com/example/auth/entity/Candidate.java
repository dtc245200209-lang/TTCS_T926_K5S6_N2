package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "candidates")
@Getter @Setter @NoArgsConstructor
public class Candidate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String fullName;
    @Column(nullable = false, unique = true) private String email;
    private String phone;
    @Column(nullable = false) private String source = "Trực tiếp";
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
}
