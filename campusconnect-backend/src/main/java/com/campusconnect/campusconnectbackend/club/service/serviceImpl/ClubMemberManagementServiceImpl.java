package com.campusconnect.campusconnectbackend.club.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClubMemberManagementServiceImpl implements ClubMemberManagementService {

    private final ClubMemberRepository clubMemberRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final EmailDispatcherService emailDispatcherService;

    @Value("${CLUB_MEMBER_MALE:default_male.png}")
    private String maleMemberDefaultImage;

    @Value("${CLUB_MEMBER_FEMALE:default_female.png}")
    private String femaleMemberDefaultImage;

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private ClubMember getClubMember(Club club, Student student, String role, String password) {
        ClubMember member = new ClubMember();
        member.setClub(club);
        member.setStudent(student);
        member.setRole(role);
        member.setPasswordHash(passwordEncoder.encode(password));
        return member;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "joined_club_count", key = "#student.id"),
            @CacheEvict(value = "joined_clubs", key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #student.id")
    })
    public MessageResponseDto addClubMember(Club club, Student student, String role) {
        return addClubMember(club, student, role, null);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "joined_club_count", key = "#student.id"),
            @CacheEvict(value = "joined_clubs", key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #student.id")
    })
    public MessageResponseDto addClubMember(Club club, Student student, String role, String rawPassword) {
        if (clubMemberRepository.existsByStudentAndClub(student, club)) {
            return new MessageResponseDto("Club Member already exists");
        }

        String password = (rawPassword != null && !rawPassword.isBlank()) ? rawPassword : generatePassword();
        ClubMember member = getClubMember(club, student, role, password);
        clubMemberRepository.save(member);

        String email = student.getEmail();
        if ((email == null || email.isBlank()) && student.getUser() != null) {
            email = student.getUser().getEmail();
        }
        if (email != null && !email.isBlank()) {
            try {
                emailDispatcherService.sendClubMemberAssigned(
                        email,
                        club.getName(),
                        role,
                        password,
                        "/campus-connect/student/dashboard"
                );
            } catch (Exception e) {
                System.err.println("Failed to send club member credentials email: " + e.getMessage());
            }
        }

        return new MessageResponseDto("ClubMember added successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "joined_club_count", key = "#studentId"),
            @CacheEvict(value = "joined_clubs", key = "'college_' + @authService.getCurrentCollegeId() + '_student_' + #studentId")
    })
    public MessageResponseDto removeClubMember(Long clubId, Long studentId) {
        if (!clubMemberRepository.existsByStudent_IdAndClub_Id(studentId, clubId)) {
            return new MessageResponseDto("Club Member does not exist");
        }
        clubMemberRepository.deleteByStudent_IdAndClub_Id(studentId, clubId);

        return new MessageResponseDto("ClubMember removed successfully");
    }

    @Override
    public String getRole(Long clubId) {
        Long studentId = authService.getCurrentUserId();
        return clubMemberRepository.findRoleByClubIdAndStudentId(clubId, studentId).orElse("You are not authorized");
    }
}
