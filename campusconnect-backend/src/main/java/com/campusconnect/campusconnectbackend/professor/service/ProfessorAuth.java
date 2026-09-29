package com.campusconnect.campusconnectbackend.professor.service;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ProfessorProfileDto;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.professor.dto.req.ProfessorSignupRequestDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfessorAuth {

    private final ProfessorRepository professorRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final CollegeService collegeService;
    private final com.campusconnect.campusconnectbackend.college.repository.DepartmentRepository departmentRepository;

    // professor signup
    @Transactional
    public AuthResponseDto store(ProfessorSignupRequestDto request) {
        if (professorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        College college = collegeService.getCollegeById(request.getCollegeId());

        Professor professor = new Professor();
        professor.setFullName(request.getFullName());
        professor.setEmail(request.getEmail());
        professor.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        professor.setCollege(college);

        String deptName = (request.getDepartment() != null && !request.getDepartment().isBlank())
                ? request.getDepartment().trim()
                : "General";

        com.campusconnect.campusconnectbackend.college.entity.Department dept =
                departmentRepository.findByCollege_IdAndNameIgnoreCase(college.getId(), deptName)
                        .orElseGet(() -> departmentRepository.findByCollege_IdAndNameIgnoreCase(college.getId(), "General")
                                .orElseGet(() -> {
                                    com.campusconnect.campusconnectbackend.college.entity.Department gen =
                                            new com.campusconnect.campusconnectbackend.college.entity.Department(college, "General", "GEN");
                                    return departmentRepository.save(gen);
                                }));

        professor.setDepartment(dept);
        if (request.getAbout() != null && !request.getAbout().isBlank()) {
            professor.setAbout(request.getAbout());
        }

        Professor savedProfessor = professorRepository.save(professor);

        String token = jwtTokenProvider.generateToken(
                savedProfessor.getId(),
                "PROFESSOR",
                savedProfessor.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "PROFESSOR",
                "/campus-connect/professor/dashboard"
        );
    }

    // professor login
    public AuthResponseDto authenticate(LoginRequestDto request) {

        String compositeUsername = "PROFESSOR:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        Professor professor = professorRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                professor.getId(),
                "PROFESSOR",
                professor.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "PROFESSOR",
                "/campus-connect/professor/dashboard"
        );
    }

    // reset password
    @Transactional
    public MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // find professor
        Professor professor = professorRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found, Try again!")
        );

        // change password
        professor.setPasswordHash(passwordEncoder.encode(password));
        professorRepository.save(professor);

        return new MessageResponseDto("Your password changed successfully!");

    }

    // get professor profile
    @Transactional(readOnly = true)
    public ProfessorProfileDto getProfile(Long professorId) {

        // find professor
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // create response
        ProfessorProfileDto profile = new ProfessorProfileDto();
        profile.setFullName(professor.getFullName());
        profile.setEmail(professor.getEmail());
        if (professor.getDepartment() != null) {
            profile.setDepartment(professor.getDepartment().getName());
            profile.setDepartmentId(professor.getDepartment().getId());
        }

        return profile;
    }

    // update profile
    @Transactional
    public MessageResponseDto updateProfile(Long professorId, ProfessorProfileDto request) {

        // find professor
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // overwrite all fields to update
        professor.setFullName(request.getFullName());
        professor.setEmail(request.getEmail());

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(professor::setDepartment);
        } else if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty() && professor.getCollege() != null) {
            departmentRepository.findByCollege_IdAndNameIgnoreCase(professor.getCollege().getId(), request.getDepartment().trim())
                .ifPresent(professor::setDepartment);
        }

        professorRepository.save(professor);

        return new MessageResponseDto("Your profile has been updated successfully!");
    }

    // change password when provided old-password
    @Transactional
    public MessageResponseDto changePassword(Long currentUserId, ChangePasswordRequestDto request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        // find professor
        Professor professor = professorRepository.findById(currentUserId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // check old-password
        if (!passwordEncoder.matches(oldPassword, professor.getPasswordHash())) {
            return new MessageResponseDto("Your old-password is wrong!");
        }


        // update
        professor.setPasswordHash(passwordEncoder.encode(newPassword));
        professorRepository.save(professor);

        return new MessageResponseDto("Your password changed successfully!");
    }

    public Professor getProfessorByEmail(String email) {

        return professorRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Professor not found, Try again!")
        );
    }
}
