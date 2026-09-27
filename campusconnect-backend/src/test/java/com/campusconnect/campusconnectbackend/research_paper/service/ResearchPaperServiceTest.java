package com.campusconnect.campusconnectbackend.research_paper.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.entity.GlobalResearchPaper;
import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchPaper;
import com.campusconnect.campusconnectbackend.research_paper.repository.GlobalResearchPaperRepository;
import com.campusconnect.campusconnectbackend.research_paper.repository.GlobalResearchPaperUpvoteRepository;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchPaperRepository;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchUpvoteRepository;
import com.campusconnect.campusconnectbackend.research_paper.service.serviceImpl.ResearchPaperServiceImpl;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResearchPaperServiceTest {

    @Mock
    private ResearchPaperRepository researchPaperRepository;

    @Mock
    private GlobalResearchPaperRepository globalResearchPaperRepository;

    @Mock
    private GlobalResearchPaperUpvoteRepository globalResearchPaperUpvoteRepository;

    @Mock
    private ResearchUpvoteRepository researchUpvoteRepository;

    @Mock
    private AuthService authService;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private ResearchPaperServiceImpl researchPaperService;

    @Test
    void testGetGlobalResearchPapers_Success() {
        College college = new College();
        college.setName("Tech University");

        User user = new User();
        user.setId(500L);

        Student student = new Student();
        student.setFullName("John Doe");
        student.setStudentId("STU123");
        student.setUser(user);

        ResearchPaper rp = new ResearchPaper();
        rp.setId(200L);
        rp.setTitle("Quantum Neural Nets");
        rp.setOverview("An overview of QNN");
        rp.setPdfUrl("https://cloudinary.com/test.pdf");
        rp.setSubject("AI");
        rp.setDepartment("Computer Science");
        rp.setCollege(college);
        rp.setUser(user);

        when(studentRepository.findByUser_Id(500L)).thenReturn(Optional.of(student));

        GlobalResearchPaper global = new GlobalResearchPaper();
        global.setId(10L);
        global.setResearchPaper(rp);
        global.setPublishedAt(LocalDateTime.now());

        when(globalResearchPaperRepository.findAllWithDetails()).thenReturn(List.of(global));
        when(authService.getCurrentUserId()).thenReturn(42L);
        when(globalResearchPaperUpvoteRepository.countByIdGlobalResearchPaperId(10L)).thenReturn(12L);
        when(globalResearchPaperUpvoteRepository.existsByIdGlobalResearchPaperIdAndIdUserId(10L, 42L)).thenReturn(false);

        List<ResearchesResponseDto> result = researchPaperService.getGlobalResearchPapers();

        assertNotNull(result);
        assertEquals(1, result.size());
        ResearchesResponseDto dto = result.get(0);
        assertEquals("Quantum Neural Nets", dto.getTitle());
        assertEquals("John Doe", dto.getStudentName());
        assertEquals("STU123", dto.getStudentId());
        assertEquals("Tech University", dto.getCollegeName());
        assertEquals(12L, dto.getUpvotesCount());
        assertFalse(dto.getIsUpvoted());
        assertTrue(dto.getIsGlobal());
    }
}
