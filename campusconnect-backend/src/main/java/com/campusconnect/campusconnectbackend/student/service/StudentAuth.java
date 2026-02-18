package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.student.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.Student;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class StudentAuth {
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final CollegeService collegeService;

    // get student-object
    public Student getObject(StudentRegisterRequestDto dto) {
        // create student
        Student student = new Student();
        student.setStudentId(dto.getId());
        student.setFullName(dto.getFullName());
        student.setEmail(dto.getEmail());
        student.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        student.setCollege(collegeService.getCollegeById(dto.getCollegeId()));
        student.setDepartment(dto.getDepartment());
        student.setYear(dto.getYear());
        student.setGender(dto.getGender());

        return student;
    }

    // create student account(college-admin feat)
    @Transactional
    public boolean createStudentAccount(StudentRegisterRequestDto request) {
        try {
            // create student
            Student student = getObject(request);
            // save in db
            studentRepository.save(student);
            return true;
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // student signup
    @Transactional
    public AuthResponseDto store(StudentRegisterRequestDto request) {

        // create student
        Student student = getObject(request);

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

    // student login
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