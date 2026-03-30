package com.campusconnect.campusconnectbackend.security.jwt;

import com.campusconnect.campusconnectbackend.college_admin.repository.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.reviewer.repository.ReviewerRepository;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final CollegeAdminRepository collegeAdminRepository;
    private final JournalistRepository journalistRepository;
    private final ReviewerRepository reviewerRepository;

    @Override
    @NullMarked
    public UserDetails loadUserByUsername(String compositeUsername)
            throws UsernameNotFoundException {

        if (!compositeUsername.contains(":")) {
            throw new UsernameNotFoundException("Invalid login format");
        }

        String[] parts = compositeUsername.split(":", 2);
        String role = parts[0];
        String email = parts[1];

        return switch (role) {
            case "STUDENT" -> studentRepository.findByEmail(email)
                    .map(s -> new CustomUserDetails(
                            s.getId(),
                            s.getCollege().getId(),
                            s.getEmail(),
                            s.getPasswordHash(),
                            "STUDENT"
                    ))
                    .orElseThrow(() ->
                            new UsernameNotFoundException("Student not found"));
            case "COLLEGE_ADMIN" -> collegeAdminRepository.findByEmail(email)
                    .map(a -> new CustomUserDetails(
                            a.getId(),
                            a.getCollege().getId(),
                            a.getEmail(),
                            a.getPasswordHash(),
                            "COLLEGE_ADMIN"
                    ))
                    .orElseThrow(() ->
                            new UsernameNotFoundException("College admin not found"));
            case "JOURNALIST" -> journalistRepository.findByStudent_Email(email)
                    .map(j -> new CustomUserDetails(
                            j.getId(),
                            j.getStudent().getCollege().getId(),
                            j.getStudent().getEmail(),
                            j.getPasswordHash(),
                            "JOURNALIST"
                    ))
                    .orElseThrow(() ->
                            new UsernameNotFoundException("Journalist not found"));
            case "REVIEWER" -> reviewerRepository.findByEmail(email)
                    .map(r -> new CustomUserDetails(
                            r.getId(),
                            r.getCollege().getId(), // reviewer has NO college
                            r.getEmail(),
                            r.getPasswordHash(),
                            "REVIEWER"
                    ))
                    .orElseThrow(() ->
                            new UsernameNotFoundException("Reviewer not found"));
            default -> throw new UsernameNotFoundException("Invalid role: " + role);
        };
    }
}