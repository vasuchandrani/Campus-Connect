package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.dto.req.SubDashboardLoginRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.JournalistStatusDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.entity.ClubMentor;
import com.campusconnect.campusconnectbackend.club.club_mentor.repository.ClubMentorRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubDashboardService {

    private final JournalistRepository journalistRepository;
    private final JournalistRequestRepository journalistRequestRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final StudentRepoService studentRepoService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ClubRepository clubRepository;
    private final ProfessorRepository professorRepository;
    private final ClubMentorRepository clubMentorRepository;

    public AuthResponseDto journalistSubLogin(Long studentId, SubDashboardLoginRequestDto request) {
        Journalist journalist = journalistRepository.findByStudent_Id(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student is not assigned as a journalist"));

        if (!passwordEncoder.matches(request.getPassword(), journalist.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid journalist password");
        }

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

    public AuthResponseDto returnToStudent(Long journalistId, SubDashboardLoginRequestDto request) {
        Journalist journalist = journalistRepository.findById(journalistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journalist not found"));

        Student student = journalist.getStudent();
        if (student == null || student.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Associated student account not found");
        }

        if (!passwordEncoder.matches(request.getPassword(), student.getUser().getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid student password");
        }

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

    public JournalistStatusDto getJournalistStatus(Long studentId) {
        Optional<Journalist> jOpt = journalistRepository.findByStudent_Id(studentId);
        if (jOpt.isPresent()) {
            return new JournalistStatusDto(true, jOpt.get().getId(), false);
        }
        boolean hasPending = journalistRequestRepository.existsByStudent_Id(studentId);
        return new JournalistStatusDto(false, null, hasPending);
    }

    public AuthResponseDto clubSubLogin(Long studentId, Long clubId, SubDashboardLoginRequestDto request) {
        ClubMember member = clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(clubId, studentId);
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student is not a member of this club");
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid club password");
        }

        String roleName = member.getRole() != null ? member.getRole().name() : "MEMBER";
        String jwtRole = "ADMIN".equalsIgnoreCase(roleName) ? "CLUB_ADMIN" : "CLUB_MEMBER";
        String redirectUrl = "ADMIN".equalsIgnoreCase(roleName)
                ? "/campus-connect/club-admin/" + clubId + "/dashboard"
                : "/campus-connect/club-member/" + clubId + "/dashboard";

        String token = jwtTokenProvider.generateToken(
                studentId,
                jwtRole,
                member.getClub().getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                jwtRole,
                redirectUrl
        );
    }

    public AuthResponseDto clubReturnToStudent(Long studentId, SubDashboardLoginRequestDto request) {
        Student student = studentRepoService.getStudent(studentId);
        if (student == null || student.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Associated student account not found");
        }

        if (!passwordEncoder.matches(request.getPassword(), student.getUser().getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid student password");
        }

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

    public AuthResponseDto mentorSubLogin(Long profId, Long clubId, SubDashboardLoginRequestDto request) {
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club not found with id: " + clubId)
        );

        Optional<ClubMentor> mentorOpt = clubMentorRepository.findByClub_IdAndProfessor_Id(clubId, profId);
        ClubMentor mentor = null;

        if (mentorOpt.isPresent()) {
            mentor = mentorOpt.get();
            Professor prof = professorRepository.findById(profId).orElse(null);
            boolean matches = passwordEncoder.matches(request.getPassword(), mentor.getPasswordHash())
                    || "mentor123".equals(request.getPassword())
                    || (prof != null && prof.getUser() != null && prof.getUser().getPassword() != null && passwordEncoder.matches(request.getPassword(), prof.getUser().getPassword()));
            if (!matches) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid club mentor password. You can use 'mentor123' or your professor account password.");
            }
        } else {
            // Check legacy fallback: if professor is club.mentor on Club table
            if (club.getMentor() != null && Objects.equals(club.getMentor().getId(), profId)) {
                Professor prof = professorRepository.findById(profId).orElse(null);
                if (prof != null && prof.getUser() != null) {
                    boolean matches = "mentor123".equals(request.getPassword())
                            || (prof.getUser().getPassword() != null && passwordEncoder.matches(request.getPassword(), prof.getUser().getPassword()));
                    if (matches) {
                        // Automatically bootstrap ClubMentor record for seamless migration
                        mentor = new ClubMentor();
                        mentor.setClub(club);
                        mentor.setProfessor(prof);
                        mentor.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                        mentor.setRole("PRIMARY_MENTOR");
                        mentor.setActive(true);
                        clubMentorRepository.save(mentor);
                    } else {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid mentor password. You can use 'mentor123' or your professor account password.");
                    }
                } else {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid mentor password");
                }
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not designated as faculty mentor for this club");
            }
        }

        String token = jwtTokenProvider.generateToken(
                profId,
                "CLUB_MENTOR",
                club.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "CLUB_MENTOR",
                "/campus-connect/professor/clubs/" + clubId + "/mentor-dashboard"
        );
    }

    public AuthResponseDto mentorReturnToProfessor(Long profId, SubDashboardLoginRequestDto request) {
        Professor professor = professorRepository.findById(profId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Associated professor account not found")
        );

        if (professor.getUser() == null || !passwordEncoder.matches(request.getPassword(), professor.getUser().getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid professor password");
        }

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
}
