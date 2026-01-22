package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.request.SigninRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.journalist.JournalistSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.Journalist;
import com.campusconnect.campusconnectbackend.journalist.JournalistRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.Student;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class JournalistAuth {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JournalistRepository journalistRepository;
    private final PasswordEncoder passwordEncoder;

    public JournalistAuth(
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            JournalistRepository journalistRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.journalistRepository = journalistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Boolean store(JournalistSignupRequestDto request, College college, Student student) {
        try {
            // create journalist
            Journalist journalist = new Journalist();
            journalist.setFullName(request.getFullName().trim());
            journalist.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            journalist.setStudent(student);
            journalist.setCollege(college);
            journalist.setCreatedAt(LocalDateTime.now());

            // save in db
            journalistRepository.save(journalist);
            return true;
        }
        catch (Exception ex) {
            System.out.println("Something went wrong "+ ex.getMessage());
            return false;
        }
    }

    public AuthResponseDto authenticate(SigninRequestDto request) {
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
