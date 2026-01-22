package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdmin;
import com.campusconnect.campusconnectbackend.dto.request.SigninRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.collegeadmin.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.college.CollegeRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CollegeAdminAuth {
    private final AuthenticationManager authenticationManager;
    private final CollegeAdminRepository collegeAdminRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final CollegeRepository collegeRepository;

    public CollegeAdminAuth(AuthenticationManager authenticationManager, CollegeAdminRepository collegeAdminRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder, CollegeRepository collegeRepository) {
        this.authenticationManager = authenticationManager;
        this.collegeAdminRepository = collegeAdminRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.collegeRepository = collegeRepository;
    }

    public AuthResponseDto store(CollegeAdminSignupRequestDto request) {

        // create college
        College college = new College();
        college.setName(request.getCollegeName());
        college.setDomain(request.getDomain());
        college.setAddress(request.getAddress());
        college.setWebsite(request.getWebsite());
        college.setAbout(request.getAboutCollege());
        college.setIsActive(false);
        college.setCreatedAt(LocalDateTime.now());

        // save college in db
        College savedCollege = collegeRepository.save(college);

        // create college-admin
        CollegeAdmin admin = new CollegeAdmin();
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setCreatedAt(LocalDateTime.now());

        admin.setCollege(savedCollege);
        // save college-admin in db
        CollegeAdmin savedAdmin = collegeAdminRepository.save(admin);

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                savedAdmin.getId(),
                "COLLEGE_ADMIN",
                savedAdmin.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "COLLEGE_ADMIN",
                "/campus-connect/college-admin/dashboard"
        );
    }

    public AuthResponseDto authenticate(SigninRequestDto request) {

        String compositeUsername = "COLLEGE_ADMIN:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        CollegeAdmin collegeAdmin = collegeAdminRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                collegeAdmin.getId(),
                "COLLEGE_ADMIN",
                collegeAdmin.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "COLLEGE_ADMIN",
                "/campus-connect/college-admin/dashboard"
        );
    }
}
