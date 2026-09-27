package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.student.dto.req.SubDashboardLoginRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.JournalistStatusDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.entity.enums.ClubRoles;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;

@ExtendWith(MockitoExtension.class)
class SubDashboardServiceTest {

    @Mock
    private JournalistRepository journalistRepository;

    @Mock
    private JournalistRequestRepository journalistRequestRepository;

    @Mock
    private ClubMemberRepository clubMemberRepository;

    @Mock
    private StudentRepoService studentRepoService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private SubDashboardService subDashboardService;

    private Journalist journalist;
    private College college;

    @BeforeEach
    void setUp() {
        college = new College();
        college.setId(10L);

        journalist = new Journalist();
        journalist.setId(5L);
        journalist.setCollege(college);
        journalist.setPasswordHash("hashed_password");
    }

    @Test
    void journalistSubLogin_Success() {
        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("plain_password");

        when(journalistRepository.findByStudent_Id(1L)).thenReturn(Optional.of(journalist));
        when(passwordEncoder.matches("plain_password", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(5L, "JOURNALIST", 10L)).thenReturn("mock_jwt_token");

        AuthResponseDto response = subDashboardService.journalistSubLogin(1L, request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("JOURNALIST", response.getRole());
        assertEquals("/campus-connect/journalist/dashboard", response.getRedirectUrl());
    }

    @Test
    void journalistSubLogin_WrongPassword_ThrowsUnauthorized() {
        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("wrong_password");

        when(journalistRepository.findByStudent_Id(1L)).thenReturn(Optional.of(journalist));
        when(passwordEncoder.matches("wrong_password", "hashed_password")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                subDashboardService.journalistSubLogin(1L, request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Invalid"));
    }

    @Test
    void journalistSubLogin_NotAJournalist_ThrowsNotFound() {
        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("password");

        when(journalistRepository.findByStudent_Id(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                subDashboardService.journalistSubLogin(999L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void getJournalistStatus_WhenJournalist_ReturnsTrue() {
        when(journalistRepository.findByStudent_Id(1L)).thenReturn(Optional.of(journalist));

        JournalistStatusDto status = subDashboardService.getJournalistStatus(1L);

        assertNotNull(status);
        assertTrue(status.isJournalist());
        assertEquals(5L, status.getJournalistId());
    }

    @Test
    void getJournalistStatus_WhenNotJournalist_ReturnsFalse() {
        when(journalistRepository.findByStudent_Id(999L)).thenReturn(Optional.empty());
        when(journalistRequestRepository.existsByStudent_Id(999L)).thenReturn(false);

        JournalistStatusDto status = subDashboardService.getJournalistStatus(999L);

        assertNotNull(status);
        assertFalse(status.isJournalist());
        assertNull(status.getJournalistId());
        assertFalse(status.isHasPendingRequest());
    }

    @Test
    void getJournalistStatus_WhenPendingRequest_ReturnsPendingTrue() {
        when(journalistRepository.findByStudent_Id(888L)).thenReturn(Optional.empty());
        when(journalistRequestRepository.existsByStudent_Id(888L)).thenReturn(true);

        JournalistStatusDto status = subDashboardService.getJournalistStatus(888L);

        assertNotNull(status);
        assertFalse(status.isJournalist());
        assertNull(status.getJournalistId());
        assertTrue(status.isHasPendingRequest());
    }

    @Test
    void returnToStudent_Success() {
        User user = new User();
        user.setPassword("hashed_student_password");

        Student student = new Student();
        student.setId(22L);
        student.setUser(user);
        student.setCollege(college);

        journalist.setStudent(student);

        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("plain_student_password");

        when(journalistRepository.findById(5L)).thenReturn(Optional.of(journalist));
        when(passwordEncoder.matches("plain_student_password", "hashed_student_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(22L, "STUDENT", 10L)).thenReturn("mock_student_token");

        AuthResponseDto response = subDashboardService.returnToStudent(5L, request);

        assertNotNull(response);
        assertEquals("mock_student_token", response.getToken());
        assertEquals("STUDENT", response.getRole());
        assertEquals("/campus-connect/student/dashboard", response.getRedirectUrl());
    }

    @Test
    void returnToStudent_WrongPassword_ThrowsUnauthorized() {
        User user = new User();
        user.setPassword("hashed_student_password");

        Student student = new Student();
        student.setId(22L);
        student.setUser(user);
        student.setCollege(college);

        journalist.setStudent(student);

        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("wrong_password");

        when(journalistRepository.findById(5L)).thenReturn(Optional.of(journalist));
        when(passwordEncoder.matches("wrong_password", "hashed_student_password")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                subDashboardService.returnToStudent(5L, request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Invalid"));
    }

    @Test
    void returnToStudent_JournalistNotFound_ThrowsNotFound() {
        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("password");

        when(journalistRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                subDashboardService.returnToStudent(999L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void clubSubLogin_Success_Admin() {
        Club club = new Club();
        club.setId(100L);
        club.setCollege(college);

        ClubMember member = new ClubMember();
        member.setId(1L);
        member.setClub(club);
        member.setRole(ClubRoles.ADMIN);
        member.setPasswordHash("encoded_club_pw");

        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("plain_club_pw");

        when(clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(100L, 22L)).thenReturn(member);
        when(passwordEncoder.matches("plain_club_pw", "encoded_club_pw")).thenReturn(true);
        when(jwtTokenProvider.generateToken(22L, "CLUB_ADMIN", 10L)).thenReturn("club_admin_token");

        AuthResponseDto res = subDashboardService.clubSubLogin(22L, 100L, request);

        assertNotNull(res);
        assertEquals("club_admin_token", res.getToken());
        assertEquals("CLUB_ADMIN", res.getRole());
        assertEquals("/campus-connect/club-admin/100/dashboard", res.getRedirectUrl());
    }

    @Test
    void clubSubLogin_Success_Member() {
        Club club = new Club();
        club.setId(100L);
        club.setCollege(college);

        ClubMember member = new ClubMember();
        member.setId(2L);
        member.setClub(club);
        member.setRole(ClubRoles.MEMBER);
        member.setPasswordHash("encoded_member_pw");

        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("plain_member_pw");

        when(clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(100L, 22L)).thenReturn(member);
        when(passwordEncoder.matches("plain_member_pw", "encoded_member_pw")).thenReturn(true);
        when(jwtTokenProvider.generateToken(22L, "CLUB_MEMBER", 10L)).thenReturn("club_member_token");

        AuthResponseDto res = subDashboardService.clubSubLogin(22L, 100L, request);

        assertNotNull(res);
        assertEquals("club_member_token", res.getToken());
        assertEquals("CLUB_MEMBER", res.getRole());
        assertEquals("/campus-connect/club-member/100/dashboard", res.getRedirectUrl());
    }

    @Test
    void clubSubLogin_WrongPassword_ThrowsUnauthorized() {
        ClubMember member = new ClubMember();
        member.setId(1L);
        member.setPasswordHash("encoded_club_pw");

        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("wrong_pw");

        when(clubMemberRepository.findClubMemberByClub_IdAndStudent_Id(100L, 22L)).thenReturn(member);
        when(passwordEncoder.matches("wrong_pw", "encoded_club_pw")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                subDashboardService.clubSubLogin(22L, 100L, request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void clubReturnToStudent_Success() {
        User user = new User();
        user.setPassword("encoded_student_pw");

        Student student = new Student();
        student.setId(22L);
        student.setUser(user);
        student.setCollege(college);

        SubDashboardLoginRequestDto request = new SubDashboardLoginRequestDto();
        request.setPassword("student_pw");

        when(studentRepoService.getStudent(22L)).thenReturn(student);
        when(passwordEncoder.matches("student_pw", "encoded_student_pw")).thenReturn(true);
        when(jwtTokenProvider.generateToken(22L, "STUDENT", 10L)).thenReturn("student_token");

        AuthResponseDto res = subDashboardService.clubReturnToStudent(22L, request);

        assertNotNull(res);
        assertEquals("student_token", res.getToken());
        assertEquals("STUDENT", res.getRole());
        assertEquals("/campus-connect/student/dashboard", res.getRedirectUrl());
    }
}
