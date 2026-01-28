package com.campusconnect.campusconnectbackend.mail_service.verification_code;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationCodeRepository
        extends JpaRepository<VerificationCode, Long> {

    Optional<VerificationCode> findTopByEmailOrderByExpiresAtDesc(@NotNull String email);
}

