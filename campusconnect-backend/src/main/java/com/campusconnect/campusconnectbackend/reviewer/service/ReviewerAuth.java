package com.campusconnect.campusconnectbackend.reviewer.service;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewerAuth {

    private final ReviewerRepository reviewerRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    // reviewer login
    public AuthResponseDto authenticate(LoginRequestDto request) {

        String compositeUsername = "REVIEWER:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        Reviewer reviewer = reviewerRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                reviewer.getId(),
                "REVIEWER",
                reviewer.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "REVIEWER",
                "/campus-connect/reviewer/dashboard"
        );
    }
}
