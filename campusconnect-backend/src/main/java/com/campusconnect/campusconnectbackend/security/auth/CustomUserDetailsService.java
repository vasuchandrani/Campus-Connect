package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.college_admin.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.journalist.JournalistRepository;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final StudentRepository studentRepository;
    private final CollegeAdminRepository collegeAdminRepository;
    private final JournalistRepository journalistRepository;
    private final ReviewerRepository reviewerRepository;

    public CustomUserDetailsService(
            StudentRepository studentRepository,
            CollegeAdminRepository collegeAdminRepository,
            JournalistRepository journalistRepository,
            ReviewerRepository reviewerRepository
    ) {
        this.studentRepository = studentRepository;
        this.collegeAdminRepository = collegeAdminRepository;
        this.journalistRepository = journalistRepository;
        this.reviewerRepository = reviewerRepository;
    }

    @Override
    @NullMarked
    public UserDetails loadUserByUsername(String compositeUsername) throws UsernameNotFoundException {

        // extract role from: "ROLE:user@email.com"
        if (!compositeUsername.contains(":")) {
            throw new UsernameNotFoundException("Invalid login format");
        }

        String[] parts = compositeUsername.split(":", 2);
        String role = parts[0];
        String email = parts[1];

        return switch (role) {
            case "STUDENT" -> studentRepository.findByEmail(email)
                    .map(s -> new CustomUserDetails(s.getEmail(), s.getPasswordHash(), "STUDENT"))
                    .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

            case "COLLEGE_ADMIN" -> collegeAdminRepository.findByEmail(email)
                    .map(a -> new CustomUserDetails(a.getEmail(), a.getPasswordHash(), "COLLEGE_ADMIN"))
                    .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

            case "JOURNALIST" -> journalistRepository.findByStudent_Email(email)
                    .map(a -> new CustomUserDetails(a.getStudent().getEmail(), a.getPasswordHash(), "JOURNALIST"))
                    .orElseThrow(() -> new UsernameNotFoundException("Journalist not found"));

            case "REVIEWER" -> reviewerRepository.findByEmail(email)
                    .map(a -> new CustomUserDetails(a.getEmail(), a.getPasswordHash(), "REVIEWER"))
                    .orElseThrow(() -> new UsernameNotFoundException("Reviewer not found"));

            default -> throw new UsernameNotFoundException("Invalid role provided");
        };
    }
}