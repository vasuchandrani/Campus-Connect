package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.StudentProfileDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class StudentAuth {
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final CollegeService collegeService;
    private final com.campusconnect.campusconnectbackend.college.repository.DepartmentRepository departmentRepository;

    // get student-object
    private Student getObject(StudentSignupRequestDto dto) {
        // create student
        Student student = new Student();
        student.setStudentId(dto.getId());
        student.setFullName(dto.getFullName());
        student.setEmail(dto.getEmail());
        student.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        com.campusconnect.campusconnectbackend.college.entity.College college = collegeService.getCollegeById(dto.getCollegeId());
        student.setCollege(college);

        String deptName = (dto.getDepartment() != null && !dto.getDepartment().isBlank())
                ? dto.getDepartment().trim()
                : "General";

        com.campusconnect.campusconnectbackend.college.entity.Department dept =
                departmentRepository.findByCollege_IdAndNameIgnoreCase(college.getId(), deptName)
                        .orElseGet(() -> departmentRepository.findByCollege_IdAndNameIgnoreCase(college.getId(), "General")
                                .orElseGet(() -> {
                                    com.campusconnect.campusconnectbackend.college.entity.Department gen =
                                            new com.campusconnect.campusconnectbackend.college.entity.Department(college, "General", "GEN");
                                    return departmentRepository.save(gen);
                                }));

        student.setDepartmentEntity(dept);
        student.setDepartment(dept.getName());
        student.setYear(dto.getYear());
        student.setGender(dto.getGender());

        return student;
    }

    // create student account(college-admin feat)
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "students", key = "'college_' + #request.collegeId"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
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
    @Caching(evict = {
            @CacheEvict(value = "students", key = "'college_' + #request.collegeId"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
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

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(dept -> {
                student.setDepartmentEntity(dept);
                student.setDepartment(dept.getName());
            });
        } else if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty() && student.getCollege() != null) {
            departmentRepository.findByCollege_IdAndNameIgnoreCase(student.getCollege().getId(), request.getDepartment().trim())
                .ifPresent(dept -> {
                    student.setDepartmentEntity(dept);
                    student.setDepartment(dept.getName());
                });
        }

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