package com.campusconnect.campusconnectbackend.security.verification_code.repository;

import com.campusconnect.campusconnectbackend.security.verification_code.entity.VerificationCode;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationCodeRepository
        extends JpaRepository<VerificationCode, Long> {

    Optional<VerificationCode> findTopByEmailOrderByExpiresAtDesc(@NotNull String email);
}

