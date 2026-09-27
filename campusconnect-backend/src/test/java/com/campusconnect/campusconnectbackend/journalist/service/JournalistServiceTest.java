package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.journalist.service.serviceImpl.JournalistServiceImpl;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import com.campusconnect.campusconnectbackend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class JournalistServiceTest {

    @Mock
    private JournalistRepository journalistRepository;

    @Mock
    private NewsPaperRepository newsPaperRepository;

    @Mock
    private AuthService authService;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailDispatcherService emailDispatcherService;

    @Mock
    private JournalistRequestRepository journalistRequestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JournalistServiceImpl journalistService;

    @Test
    void testAddJournalistByEmail_Success() {
        Long collegeId = 5L;
        College college = new College();
        college.setId(collegeId);

        Student student = new Student();
        student.setId(50L);
        student.setEmail("peter.parker@dailybugle.edu");
        student.setFullName("Peter Parker");
        student.setCollege(college);

        when(studentRepository.findByEmail("peter.parker@dailybugle.edu")).thenReturn(Optional.of(student));
        when(journalistRepository.existsByStudent_Id(50L)).thenReturn(false);
        when(journalistRequestRepository.findByStudent_Id(50L)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(String.class))).thenReturn("encoded_pass");

        MessageResponseDto response = journalistService.addJournalistByEmail("peter.parker@dailybugle.edu", collegeId, 1L);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("Journalist assigned successfully"));
        verify(journalistRepository).save(any(Journalist.class));
        verify(emailDispatcherService).sendJournalistRequestAccepted(any());
    }

    @Test
    void testAddJournalistByEmail_WrongCollege_ThrowsBadRequest() {
        Long collegeId = 5L;
        College wrongCollege = new College();
        wrongCollege.setId(999L);

        Student student = new Student();
        student.setId(50L);
        student.setEmail("intruder@other.edu");
        student.setCollege(wrongCollege);

        when(studentRepository.findByEmail("intruder@other.edu")).thenReturn(Optional.of(student));

        assertThrows(ResponseStatusException.class, () ->
                journalistService.addJournalistByEmail("intruder@other.edu", collegeId, 1L)
        );
    }
}
