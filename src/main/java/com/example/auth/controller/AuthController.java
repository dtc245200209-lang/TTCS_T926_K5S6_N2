package com.example.auth.controller;

import com.example.auth.dto.ApiResponse;
import com.example.auth.dto.ChangePasswordRequest;
import com.example.auth.dto.ChangePasswordResponse;
import com.example.auth.service.AuthService;
import com.example.auth.service.PasswordResetService;
import com.example.auth.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Cho phép frontend (như Live Server) gọi API
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> currentUser(Authentication authentication) {
        var user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new com.example.auth.exception.AppException("Người dùng không tồn tại"));
        var profile = new java.util.LinkedHashMap<String, Object>();
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", profile));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> requestPasswordReset(
            @Valid @RequestBody com.example.auth.dto.ForgotPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Nếu email đã đăng ký, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
                passwordResetService.requestReset(request.email())));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody com.example.auth.dto.ResetPasswordRequest request) {
        passwordResetService.confirmReset(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."));
    }

    /**
     * Endpoint đăng nhập để lấy JWT token thử nghiệm
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<com.example.auth.dto.LoginResponse>> login(
            @Valid @RequestBody com.example.auth.dto.LoginRequest request) {
        com.example.auth.dto.LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    /**
     * Endpoint đổi mật khẩu và thu hồi các phiên đăng nhập khác.
     * Yêu cầu người dùng phải gửi kèm JWT token hợp lệ trong header Authorization: Bearer <token>.
     *
     * @param authentication Đối tượng chứa thông tin người dùng đã xác thực từ Security Context
     * @param request        DTO chứa mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu
     * @return ApiResponse chứa ChangePasswordResponse kèm token mới cho phiên hiện tại
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<ChangePasswordResponse>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        String currentUsername = authentication.getName();
        ChangePasswordResponse response = authService.changePassword(currentUsername, request);

        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", response));
    }

    /**
     * Endpoint chủ động thu hồi tất cả các phiên đăng nhập (Đăng xuất khỏi tất cả thiết bị).
     *
     * @param authentication Thông tin người dùng hiện tại
     * @return ApiResponse thông báo thành công
     */
    @PostMapping("/revoke-sessions")
    public ResponseEntity<ApiResponse<Void>> revokeAllSessions(Authentication authentication) {
        String currentUsername = authentication.getName();
        authService.revokeAllSessions(currentUsername);

        return ResponseEntity.ok(ApiResponse.success("Đã thu hồi tất cả các phiên đăng nhập thành công"));
    }
}
