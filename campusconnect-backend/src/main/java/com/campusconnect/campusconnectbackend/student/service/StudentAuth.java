package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.student.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StudentAuth {
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final CollegeService collegeService;

    public AuthResponseDto store(StudentSignupRequestDto request) {

        // create student
        Student student = new Student();
        student.setStudentId(request.getId());
        student.setFullName(request.getFullName());
        student.setEmail(request.getEmail());
        student.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        student.setCollege(collegeService.getCollegeByName(request.getCollegeName()));
        student.setDepartment(request.getDepartment());
        student.setYear(request.getYear());
        student.setCreatedAt(LocalDateTime.now());

        // save in db
        Student savedStudent = studentRepository.save(student);

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                savedStudent.getId(),
                "STUDENT",
                savedStudent.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "STUDENT",
                "/campus-connect/student/dashboard"
        );
    }

    public AuthResponseDto authenticate(LoginRequestDto request) {

        String compositeUsername = "STUDENT:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        Student student = studentRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found, Try again!"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                student.getId(),
                "STUDENT",
                student.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "STUDENT",
                "/campus-connect/student/dashboard"
        );
    }
}