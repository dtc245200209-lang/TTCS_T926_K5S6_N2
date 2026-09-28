package com.example.auth;

import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    /**
     * Khởi tạo tài khoản mẫu để kiểm thử tính năng ngay khi khởi chạy
     */
    @Bean
    @SuppressWarnings("null")
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("testuser").isEmpty()) {
                User user = User.builder()
                        .username("testuser")
                        .email("testuser@example.com")
                        .password(passwordEncoder.encode("OldPassword123"))
                        .tokenVersion(1L)
                        .role("ROLE_USER")
                        .build();
                userRepository.save(user);
                System.out.println(">>> Đã khởi tạo người dùng mẫu: testuser / OldPassword123 (tokenVersion: 1)");
            }
        };
    }
}
