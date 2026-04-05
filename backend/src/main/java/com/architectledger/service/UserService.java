package com.architectledger.service;

import com.architectledger.dto.response.PagedResponse;
import com.architectledger.dto.response.UserResponse;
import com.architectledger.entity.User;
import com.architectledger.exception.BadRequestException;
import com.architectledger.exception.ResourceNotFoundException;
import com.architectledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PagedResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return PagedResponse.<UserResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public UserResponse getUserById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String role) {
        User user = findOrThrow(id);
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = findOrThrow(id);
        user.setStatus(user.getStatus() == User.UserStatus.ACTIVE
                ? User.UserStatus.INACTIVE : User.UserStatus.ACTIVE);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new ResourceNotFoundException("User not found: " + id);
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponse updateProfile(String email, String newName, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        if (newName != null && !newName.isBlank()) {
            user.setName(newName.trim());
        }
        if (newPassword != null && !newPassword.isBlank()) {
            if (currentPassword == null || currentPassword.isBlank() || !passwordEncoder.matches(currentPassword, user.getPassword())) {
                System.out.println("Password mismatch for user: " + email);
                throw new BadRequestException("Current password is incorrect");
            }
            if (newPassword.length() < 6) {
                throw new BadRequestException("New password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        }
        return toResponse(userRepository.save(user));
    }

    public User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
