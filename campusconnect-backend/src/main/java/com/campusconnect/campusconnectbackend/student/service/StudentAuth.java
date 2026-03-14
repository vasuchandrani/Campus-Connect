package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.StudentProfileDto;
import org.springframework.transaction.annotation.Transactional;
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
    private Student getObject(StudentSignupRequestDto dto) {
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
    public boolean createStudentAccount(StudentSignupRequestDto request) {
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
    public AuthResponseDto store(StudentSignupRequestDto request) {

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

    // get profile
    public StudentProfileDto getProfile(Long studentId) {

        // find student
        Student student = studentRepository.findById(studentId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // create response
        StudentProfileDto profile = new StudentProfileDto();
        profile.setFullName(student.getFullName());
        profile.setGender(student.getGender());

        return profile;
    }

    // update profile
    @Transactional
    public MessageResponseDto updateProfile(Long studentId, StudentProfileDto request) {

        // find student
        Student student = studentRepository.findById(studentId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // overwrite all fields to update
        student.setFullName(request.getFullName());
        student.setGender(request.getGender());

        studentRepository.save(student);

        return new MessageResponseDto("Your profile has been updated successfully!");
    }

    // reset password -(forget password)
    @Transactional
    public MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {

        String email = request.getEmail();
        String password = request.getPassword();

        // find student
        Student student = studentRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found, Try again!")
        );

        // change password
        student.setPasswordHash(passwordEncoder.encode(password));
        studentRepository.save(student);

        return new MessageResponseDto("Your password changed successfully!");
    }

    // change password when provided old-password
    @Transactional
    public MessageResponseDto changePassword(Long studentId, ChangePasswordRequestDto request) {

        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        // find student
        Student student = studentRepository.findById(studentId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // check old-password
        if (!passwordEncoder.matches(oldPassword, student.getPasswordHash())) {
            throw new RuntimeException("Your old-password is wrong!");
        }

        // update
        student.setPasswordHash(passwordEncoder.encode(newPassword));
        studentRepository.save(student);

        return new MessageResponseDto("Your password changed successfully!");
    }

    public Student getStudentByEmail(String email) {
        return studentRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Student not found, Try again!")
        );
    }
}