package com.campusconnect.campusconnectbackend.professor.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.req.ProfessorSignupRequestDto;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfessorAuthTest {

    @Mock
    private ProfessorRepository professorRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CollegeService collegeService;

    @InjectMocks
    private ProfessorAuth professorAuth;

    @Test
    void testProfessorSignup_Success() {
        ProfessorSignupRequestDto request = new ProfessorSignupRequestDto();
        request.setFullName("Dr. Robert Oppenheimer");
        request.setEmail("oppenheimer@caltech.edu");
        request.setPassword("quantum123");
        request.setCollegeId(10L);
        request.setDepartment("Physics");
        request.setAbout("Theoretical Physics Lead");

        College college = new College();
        college.setId(10L);
        college.setName("Caltech");

        when(professorRepository.findByEmail("oppenheimer@caltech.edu")).thenReturn(Optional.empty());
        when(collegeService.getCollegeById(10L)).thenReturn(college);
        when(passwordEncoder.encode("quantum123")).thenReturn("hashed_quantum123");
        when(professorRepository.save(any(Professor.class))).thenAnswer(invocation -> {
            Professor p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });
        when(jwtTokenProvider.generateToken(100L, "PROFESSOR", 10L)).thenReturn("jwt.token.oppenheimer");

        AuthResponseDto response = professorAuth.store(request);

        assertNotNull(response);
        assertEquals("jwt.token.oppenheimer", response.getToken());
        assertEquals("PROFESSOR", response.getRole());
        assertEquals("/campus-connect/professor/dashboard", response.getRedirectUrl());
    }

    @Test
    void testProfessorSignup_DuplicateEmail_ThrowsException() {
        ProfessorSignupRequestDto request = new ProfessorSignupRequestDto();
        request.setEmail("existing@caltech.edu");

        when(professorRepository.findByEmail("existing@caltech.edu")).thenReturn(Optional.of(new Professor()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> professorAuth.store(request));
        assertTrue(ex.getMessage().contains("Email already in use"));
    }
}
