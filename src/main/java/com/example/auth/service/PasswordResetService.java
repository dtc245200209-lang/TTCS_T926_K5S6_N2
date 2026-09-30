package com.example.auth.service;

import com.example.auth.dto.ResetPasswordRequest;
import com.example.auth.entity.PasswordResetToken;
import com.example.auth.entity.User;
import com.example.auth.exception.AppException;
import com.example.auth.repository.PasswordResetTokenRepository;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder encoder;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public Map<String, String> requestReset(String email) {
        User user = users.findByEmailIgnoreCase(email.trim()).orElse(null);
        if (user == null) return Map.of();
        tokens.deleteByUser_Id(user.getId());
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant expiry = Instant.now().plus(Duration.ofMinutes(30));
        tokens.save(new PasswordResetToken(user, hash(raw), expiry));
        // Local development only: production email delivery should replace this response.
        return Map.of("resetToken", raw, "expiresAt", expiry.toString());
    }

    @Transactional
    public void confirmReset(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword()))
            throw new AppException("Mật khẩu xác nhận không khớp.");
        PasswordResetToken token = tokens.findByTokenHash(hash(request.token()))
                .orElseThrow(() -> new AppException("Mã đặt lại không hợp lệ hoặc đã hết hạn."));
        if (!token.getExpiresAt().isAfter(Instant.now())) {
            tokens.delete(token);
            throw new AppException("Mã đặt lại không hợp lệ hoặc đã hết hạn.");
        }
        User user = token.getUser();
        user.setPassword(encoder.encode(request.newPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        users.save(user);
        tokens.delete(token);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Không thể tạo mã bảo mật.", ex);
        }
    }
}
