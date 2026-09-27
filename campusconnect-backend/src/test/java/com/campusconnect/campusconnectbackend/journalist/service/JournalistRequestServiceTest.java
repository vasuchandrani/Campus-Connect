package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.journalist.service.serviceImpl.JournalistRequestServiceImpl;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import com.campusconnect.campusconnectbackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JournalistRequestServiceTest {

    @Mock
    private AuthService authService;

    @Mock
    private JournalistRepository journalistRepository;

    @Mock
    private JournalistRequestRepository journalistRequestRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailDispatcherService emailDispatcherService;

    @Mock
    private StudentRepoService studentRepoService;

    @InjectMocks
    private JournalistRequestServiceImpl journalistRequestService;

    private College college;
    private Student student;
    private User user;
    private JournalistRequest journalistRequest;

    @BeforeEach
    void setUp() {
        college = new College();
        college.setId(100L);

        user = new User();
        user.setId(1L);
        user.setEmail("student@college.edu");

        student = new Student();
        student.setId(50L);
        student.setStudentId("STU001");
        student.setFullName("John Doe");
        student.setUser(user);
        student.setCollege(college);

        journalistRequest = new JournalistRequest();
        journalistRequest.setId(10L);
        journalistRequest.setStudent(student);
        journalistRequest.setCollege(college);
        journalistRequest.setWhy("Passionate about campus journalism");
        journalistRequest.setPortfolioLink("https://portfolio.com");
    }

    @Test
    void acceptJournalistRequest_Success_SendsEmailWithCredentials() {
        when(journalistRequestRepository.findByIdWithStudentAndCollege(10L))
                .thenReturn(Optional.of(journalistRequest));
        when(journalistRepository.existsByStudent_Id(50L)).thenReturn(false);
        when(passwordEncoder.encode(any(String.class))).thenReturn("hashed_pass");
        when(emailDispatcherService.sendJournalistRequestAccepted(any(JournalistAssignmentDto.class))).thenReturn(true);

        MessageResponseDto response = journalistRequestService.acceptJournalistRequest(10L);

        assertNotNull(response);
        assertEquals("Journalist Request accepted successfully", response.getMessage());

        // Verify journalist is saved with student details
        ArgumentCaptor<Journalist> journalistCaptor = ArgumentCaptor.forClass(Journalist.class);
        verify(journalistRepository).save(journalistCaptor.capture());
        Journalist savedJournalist = journalistCaptor.getValue();
        assertEquals("John Doe", savedJournalist.getFullName());
        assertEquals("hashed_pass", savedJournalist.getPasswordHash());
        assertEquals(student, savedJournalist.getStudent());
        assertEquals(college, savedJournalist.getCollege());
        assertTrue(savedJournalist.isActive());

        // Verify request is deleted
        verify(journalistRequestRepository).delete(journalistRequest);

        // Verify email was dispatched with student's email and credentials
        ArgumentCaptor<JournalistAssignmentDto> emailCaptor = ArgumentCaptor.forClass(JournalistAssignmentDto.class);
        verify(emailDispatcherService).sendJournalistRequestAccepted(emailCaptor.capture());
        JournalistAssignmentDto sentDto = emailCaptor.getValue();
        assertEquals("student@college.edu", sentDto.getEmail());
        assertNotNull(sentDto.getPassword());
        assertFalse(sentDto.getPassword().isBlank());
        assertEquals("/campus-connect/journalist/dashboard", sentDto.getDashboardLink());
    }

    @Test
    void acceptJournalistRequest_AlreadyAccepted_ThrowsConflict() {
        when(journalistRequestRepository.findByIdWithStudentAndCollege(10L))
                .thenReturn(Optional.of(journalistRequest));
        when(journalistRepository.existsByStudent_Id(50L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () ->
                journalistRequestService.acceptJournalistRequest(10L)
        );

        verify(journalistRequestRepository).delete(journalistRequest);
        verify(journalistRepository, never()).save(any());
        verify(emailDispatcherService, never()).sendJournalistRequestAccepted(any());
    }

    @Test
    void acceptJournalistRequest_NotFound_ThrowsNotFound() {
        when(journalistRequestRepository.findByIdWithStudentAndCollege(999L))
                .thenReturn(Optional.empty());
        when(journalistRequestRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                journalistRequestService.acceptJournalistRequest(999L)
        );

        verify(journalistRepository, never()).save(any());
        verify(emailDispatcherService, never()).sendJournalistRequestAccepted(any());
    }
}
