package com.architectledger.config;

import com.architectledger.entity.User;
import com.architectledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Override
    public void run(String... args) throws Exception {
        if (adminEmail != null && !adminEmail.trim().isEmpty()) {
            userRepository.findByEmail(adminEmail).ifPresentOrElse(user -> {
                if (user.getRole() != User.Role.ADMIN) {
                    user.setRole(User.Role.ADMIN);
                    userRepository.save(user);
                    log.info("Successfully upgraded {} to ADMIN role.", adminEmail);
                }
            }, () -> {
                log.warn("ADMIN_EMAIL property was set to '{}', but no such user found. Please register this account first.", adminEmail);
            });
        }
    }
}
