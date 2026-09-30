package com.example.passwordreset.service;

import com.example.passwordreset.dto.ResetPasswordRequest;
import com.example.passwordreset.entity.PasswordResetToken;
import com.example.passwordreset.entity.UserAccount;
import com.example.passwordreset.exception.ApiException;
import com.example.passwordreset.repository.PasswordResetTokenRepository;
import com.example.passwordreset.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String INVALID_TOKEN_MESSAGE = "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";

    private final UserAccountRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.reset.token-ttl-minutes:30}")
    private long tokenTtlMinutes;

    @Value("${app.reset.expose-token:true}")
    private boolean exposeToken;

    @Value("${app.reset.log-token:false}")
    private boolean logToken;

    @Transactional
    public Map<String, String> requestReset(String suppliedEmail) {
        String email = suppliedEmail.trim().toLowerCase();
        Optional<UserAccount> userResult = userRepository.findByEmailIgnoreCase(email);
        if (userResult.isEmpty()) return Map.of();

        UserAccount user = userResult.get();
        tokenRepository.deleteByUserId(user.getId());

        byte[] randomToken = new byte[32];
        SECURE_RANDOM.nextBytes(randomToken);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomToken);
        Instant expiry = Instant.now().plus(Duration.ofMinutes(Math.max(1, tokenTtlMinutes)));
        tokenRepository.save(new PasswordResetToken(user, sha256(rawToken), expiry));

        // Replace this local development hook with the organization's email provider.
        if (logToken) {
            System.out.printf("[development] Password reset token for %s: %s%n", user.getEmail(), rawToken);
        }
        return exposeToken ? Map.of("resetToken", rawToken, "expiresAt", expiry.toString()) : Map.of();
    }

    @Transactional
    public void confirmReset(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp.");
        }

        PasswordResetToken token = tokenRepository.findByHashForUpdate(sha256(request.token()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, INVALID_TOKEN_MESSAGE));
        if (!token.getExpiresAt().isAfter(Instant.now())) {
            tokenRepository.delete(token);
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_TOKEN_MESSAGE);
        }

        UserAccount user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
