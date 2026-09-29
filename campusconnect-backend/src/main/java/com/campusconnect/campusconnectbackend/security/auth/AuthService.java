package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;
import com.campusconnect.campusconnectbackend.college.service.CollegeSubscriptionService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminAuth;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.req.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.professor.service.ProfessorAuth;
import com.campusconnect.campusconnectbackend.security.jwt.CustomUserDetails;
import com.campusconnect.campusconnectbackend.student.service.StudentAuth;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentAuth studentAuth;
    private final CollegeAdminAuth collegeAdminAuth;
    private final ProfessorAuth professorAuth;
    private final JournalistAuth journalistAuth;
    private final CollegeSubscriptionService collegeSubscriptionService;
    private final com.campusconnect.campusconnectbackend.user.repository.UserRepository userRepository;

    // check subscription still active or not
    private boolean checkSubscription (Long collegeId) {
        return true; // Bypassed for QA testing
    }

    public AuthResponseDto signup(SignupRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" ->  {
                StudentSignupRequestDto dto = (StudentSignupRequestDto) request;

                if (checkSubscription(dto.getCollegeId())) {
                    yield studentAuth.store(dto);
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EXPIRE");
            }

            case "PROFESSOR" -> {
                com.campusconnect.campusconnectbackend.professor.dto.req.ProfessorSignupRequestDto dto =
                        (com.campusconnect.campusconnectbackend.professor.dto.req.ProfessorSignupRequestDto) request;

                if (checkSubscription(dto.getCollegeId())) {
                    yield professorAuth.store(dto);
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EXPIRE");
            }

            // College Admin bypasses subscription check intentionally:
            // They must be able to login even with expired subscription
            // in order to access the renewal/payment flow.
            case "COLLEGE_ADMIN" -> collegeAdminAuth.store((CollegeAdminSignupRequestDto) request);

            default -> throw new IllegalArgumentException("Invalid role");
        };
    }


    public AuthResponseDto login(LoginRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" -> {
                Student student = studentAuth.getStudentByEmail(request.getEmail());
                College college = student.getCollege();

                if (checkSubscription(college.getId())) {
                    yield studentAuth.authenticate(request);
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EXPIRE");
            }

            // College Admin bypasses subscription check intentionally:
            // They must be able to login even with expired subscription
            // in order to access the renewal/payment flow.
            case "COLLEGE_ADMIN" -> collegeAdminAuth.authenticate(request);

            case "JOURNALIST" -> {
                Journalist journalist = journalistAuth.getJournalistByEmail(request.getEmail());
                College college = journalist.getCollege();

                if (checkSubscription(college.getId())) {
                    yield journalistAuth.authenticate(request);
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EXPIRE");
            }

            case "PROFESSOR" -> {
                Professor professor = professorAuth.getProfessorByEmail(request.getEmail());
                College college = professor.getCollege();

                if (checkSubscription(college.getId())) {
                    yield professorAuth.authenticate(request);
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EXPIRE");
            }

            default -> throw new IllegalArgumentException("Invalid role");
        };
    }

    // get current authenticate user-principal
    private CustomUserDetails principal() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails p)) {
            throw new IllegalStateException("Unauthenticated access");
        }
        return p;
    }

    public Long getCurrentUserId() {
        return principal().getUserId();
    }
    public Long getCurrentCollegeId() {
        return principal().getCollegeId();
    }
    public String getCurrentRole() {
        return principal().getRole();
    }

    private final com.campusconnect.campusconnectbackend.student.repository.StudentRepository studentRepository;
    private final com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository professorRepository;
    private final com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository journalistRepository;

    public com.campusconnect.campusconnectbackend.user.entity.User getCurrentUser() {
        Long id = getCurrentUserId();
        String role = getCurrentRole();
        
        if ("STUDENT".equals(role) || "CLUB_MEMBER".equals(role) || "CLUB_ADMIN".equals(role)) {
            return studentRepository.findById(id).orElseThrow(() -> new IllegalStateException("Student not found")).getUser();
        } else if ("PROFESSOR".equals(role) || "CLUB_MENTOR".equals(role)) {
            return professorRepository.findById(id).orElseThrow(() -> new IllegalStateException("Professor not found")).getUser();
        } else if ("JOURNALIST".equals(role)) {
            return journalistRepository.findById(id).orElseThrow(() -> new IllegalStateException("Journalist not found")).getStudent().getUser();
        } else {
            return userRepository.findById(id).orElseThrow(() -> new IllegalStateException("User not found"));
        }
    }
}