package com.campusconnect.campusconnectbackend.reviewer.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.request.SigninRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.reviewer.ReviewerSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReviewerAuth {

    private final ReviewerRepository reviewerRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public ReviewerAuth(ReviewerRepository reviewerRepository, JwtTokenProvider jwtTokenProvider, AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder) {
        this.reviewerRepository = reviewerRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    public Boolean store(ReviewerSignupRequestDto request, College college) {
        try {
            // create reviewer
            Reviewer reviewer = new Reviewer();
            reviewer.setFullName(request.getFullName());
            reviewer.setEmail(request.getEmail());
            reviewer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            reviewer.setCollege(college);
            reviewer.setCreatedAt(LocalDateTime.now());

            // save in db
            reviewerRepository.save(reviewer);
            return true;
        }
        catch (Exception ex) {
            System.out.println("Something went wrong "+ ex.getMessage());
            return false;
        }
    }

    public AuthResponseDto authenticate(SigninRequestDto request) {

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
