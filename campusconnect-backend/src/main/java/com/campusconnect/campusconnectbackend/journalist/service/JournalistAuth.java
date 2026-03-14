package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.JournalistProfileDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JournalistAuth {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JournalistRepository journalistRepository;
    private final PasswordEncoder passwordEncoder;

    // journalist login
    public AuthResponseDto authenticate(LoginRequestDto request) {
        String compositeUsername = "JOURNALIST:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        Journalist journalist = journalistRepository
                .findByStudent_Email(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                journalist.getId(),
                "JOURNALIST",
                journalist.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "JOURNALIST",
                "/campus-connect/journalist/dashboard"
        );
    }

    // reset password
    @Transactional
    public MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // find student
        Journalist journalist = journalistRepository.findByStudent_Email(email).orElseThrow(
                () -> new RuntimeException("User not found, Try again!")
        );

        // change password
        journalist.setPasswordHash(passwordEncoder.encode(password));
        journalistRepository.save(journalist);

        return new MessageResponseDto("Your password changed successfully!");
    }

    // get journalist profile
    public JournalistProfileDto getProfile(Long journalistId) {

        // find journalist
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // create response
        JournalistProfileDto profile = new JournalistProfileDto();
        profile.setFullName(journalist.getFullName());
        profile.setAbout(journalist.getAbout());
        profile.setPortfolio(journalist.getPortfolio());

        return profile;
    }

    // update profile
    @Transactional
    public MessageResponseDto updateProfile(Long journalistId, JournalistProfileDto request) {

        // find journalist
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // overwrite all fields to update
        journalist.setFullName(request.getFullName());
        journalist.setAbout(request.getAbout());
        journalist.setPortfolio(request.getPortfolio());

        journalistRepository.save(journalist);

        return new MessageResponseDto("Your profile has been updated successfully!");
    }

    // change password when provided old-password
    @Transactional
    public MessageResponseDto changePassword(Long currentUserId, ChangePasswordRequestDto request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        // find college-admin
        Journalist journalist = journalistRepository.findById(currentUserId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // check old-password
        if (!passwordEncoder.matches(oldPassword, journalist.getPasswordHash())) {
            return new MessageResponseDto("Your old-password is wrong!");
        }


        // update
        journalist.setPasswordHash(passwordEncoder.encode(newPassword));
        journalistRepository.save(journalist);

        return new MessageResponseDto("Your password changed successfully!");
    }

    public Journalist getJournalistByEmail(String email) {

        return journalistRepository.findByStudent_Email(email).orElseThrow(
                () -> new RuntimeException("Journalist not found, Try again!")
        );
    }
}
