package com.example.auth.service;

import com.example.auth.dto.UserRequest;
import com.example.auth.dto.UserResponse;

import java.util.List;
import java.util.Set;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse createUser(UserRequest request);
    UserResponse updateUserRoles(Long id, Set<String> roles);
    UserResponse toggleLockUser(Long id);
}
