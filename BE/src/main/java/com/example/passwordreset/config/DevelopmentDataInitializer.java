package com.example.passwordreset.config;

import com.example.passwordreset.entity.UserAccount;
import com.example.passwordreset.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DevelopmentDataInitializer {

    @Bean
    CommandLineRunner seedDevelopmentAccount(
            UserAccountRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.enabled:false}") boolean seedEnabled,
            @Value("${app.seed.email:testuser@example.com}") String email,
            @Value("${app.seed.password:ChangeMe123!}") String password) {
        return args -> {
            if (seedEnabled && userRepository.findByEmailIgnoreCase(email).isEmpty()) {
                userRepository.save(new UserAccount(email.toLowerCase(), passwordEncoder.encode(password)));
                System.out.println("[development] Seed account created: " + email);
            }
        };
    }
}
