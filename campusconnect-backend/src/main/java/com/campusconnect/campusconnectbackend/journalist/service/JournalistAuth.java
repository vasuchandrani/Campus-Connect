package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JournalistAuth {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JournalistRepository journalistRepository;

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
}
