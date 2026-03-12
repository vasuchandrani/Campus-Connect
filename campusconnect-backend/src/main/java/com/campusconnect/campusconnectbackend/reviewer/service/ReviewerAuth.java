package com.campusconnect.campusconnectbackend.reviewer.service;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ReviewerProfileDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewerAuth {

    private final ReviewerRepository reviewerRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

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

    // reset password
    @Transactional
    public MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // find student
        Reviewer reviewer = reviewerRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found, Try again!")
        );

        // change password
        reviewer.setPasswordHash(passwordEncoder.encode(password));
        reviewerRepository.save(reviewer);

        return new MessageResponseDto("Your password changed successfully!");

    }

    // get reviewer profile
    public ReviewerProfileDto getProfile(Long reviewerId) {

        // find student
        Reviewer reviewer = reviewerRepository.findById(reviewerId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // create response
        ReviewerProfileDto profile = new ReviewerProfileDto();
        profile.setFullName(reviewer.getFullName());
        profile.setEmail(reviewer.getEmail());

        return profile;
    }

    // update profile
    @Transactional
    public MessageResponseDto updateProfile(Long reviewerId, ReviewerProfileDto request) {

        // find reviewer
        Reviewer reviewer = reviewerRepository.findById(reviewerId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // overwrite all fields to update
        reviewer.setFullName(request.getFullName());
        reviewer.setEmail(request.getEmail());

        reviewerRepository.save(reviewer);

        return new MessageResponseDto("Your profile has been updated successfully!");
    }

    // change password when provided old-password
    @Transactional
    public MessageResponseDto changePassword(Long currentUserId, ChangePasswordRequestDto request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        // find college-admin
        Reviewer reviewer = reviewerRepository.findById(currentUserId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // check old-password
        if (!passwordEncoder.matches(oldPassword, reviewer.getPasswordHash())) {
            return new MessageResponseDto("Your old-password is wrong!");
        }


        // update
        reviewer.setPasswordHash(passwordEncoder.encode(newPassword));
        reviewerRepository.save(reviewer);

        return new MessageResponseDto("Your password changed successfully!");
    }
}
