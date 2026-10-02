package com.example.auth.service.impl;

import com.example.auth.dto.UserRequest;
import com.example.auth.dto.UserResponse;
import com.example.auth.entity.User;
import com.example.auth.exception.AppException;
import com.example.auth.repository.UserRepository;
import com.example.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public UserResponse createUser(UserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException("Email đã tồn tại");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException("Username đã tồn tại");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(request.getRoles())
                .tokenVersion(1L)
                .build();
        
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateUserRoles(Long id, Set<String> roles) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
        
        // Prevent admin from revoking their own admin privileges
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && user.getUsername().equals(authentication.getName())) {
            if (!roles.contains("ROLE_ADMIN") && !roles.contains("ADMIN")) {
                throw new AppException("Quản trị viên không thể tự thu hồi quyền quản trị của chính mình");
            }
        }
        
        user.setRoles(roles);
        // Force token invalidation by incrementing token version
        user.setTokenVersion(user.getTokenVersion() + 1); 
        
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse toggleLockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
                
        // Không cho phép khóa tài khoản root admin (bảo vệ an toàn)
        if (user.getRoles().contains("ROLE_ADMIN") && user.getUsername().equals("quantrihethong")) {
            throw new AppException("Không thể khóa tài khoản quản trị viên gốc");
        }
        
        // Ngăn quản trị viên tự khóa tài khoản của chính mình
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && user.getUsername().equals(authentication.getName())) {
            throw new AppException("Bạn không thể tự khóa tài khoản của chính mình");
        }
        
        user.setIsLocked(!Boolean.TRUE.equals(user.getIsLocked()));
        if (Boolean.TRUE.equals(user.getIsLocked())) {
            user.setLockReason("Khóa bởi Quản trị viên");
            user.setLockTime(LocalDateTime.now());
            user.setTokenVersion(user.getTokenVersion() + 1); // Đăng xuất người dùng bị khóa ngay lập tức
        } else {
            user.setLockReason(null);
            user.setLockTime(null);
        }
        
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse adminChangePassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        
        return mapToResponse(userRepository.save(user));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .isLocked(Boolean.TRUE.equals(user.getIsLocked()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
