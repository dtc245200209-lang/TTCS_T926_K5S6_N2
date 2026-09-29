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
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String encodedPassword = passwordEncoder.encode("123456@");
            
            String[] emails = {
                "dtc245200623@ictu.edu.vn",
                "dtc245200209@ictu.edu.vn",
                "dtc245200288@ictu.edu.vn"
            };

            for (String email : emails) {
                if (userRepository.findByEmail(email).isEmpty()) {
                    String username = email.substring(0, email.indexOf("@"));
                    User user = User.builder()
                            .username(username)
                            .email(email)
                            .password(encodedPassword)
                            .tokenVersion(1L)
                            .role("ROLE_USER")
                            .build();
                    userRepository.save(user);
                    System.out.println(">>> Đã khởi tạo người dùng: " + email);
                }
            }
        };
    }
}
