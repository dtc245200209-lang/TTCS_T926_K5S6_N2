package com.example.passwordreset.controller;

import com.example.passwordreset.dto.ApiResponse;
import com.example.passwordreset.dto.ForgotPasswordRequest;
import com.example.passwordreset.dto.ResetPasswordRequest;
import com.example.passwordreset.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5500", "http://127.0.0.1:5500",
        "http://localhost:5501", "http://127.0.0.1:5501"
})
public class AuthController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestReset(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Nếu email đã đăng ký, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
                passwordResetService.requestReset(request.email())));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> confirmReset(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.confirmReset(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
