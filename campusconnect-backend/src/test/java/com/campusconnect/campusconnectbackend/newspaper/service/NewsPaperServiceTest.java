package com.campusconnect.campusconnectbackend.newspaper.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.newspaper.entity.GlobalNewsPaper;
import com.campusconnect.campusconnectbackend.newspaper.entity.NewsPaper;
import com.campusconnect.campusconnectbackend.newspaper.repository.GlobalNewsPaperRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.GlobalNewsUpvoteRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsUpvoteRepository;
import com.campusconnect.campusconnectbackend.newspaper.service.serviceImpl.NewsPaperServiceImpl;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsPaperServiceTest {

    @Mock
    private NewsPaperRepository newsPaperRepository;

    @Mock
    private GlobalNewsPaperRepository globalNewsPaperRepository;

    @Mock
    private GlobalNewsUpvoteRepository globalNewsUpvoteRepository;

    @Mock
    private NewsUpvoteRepository newsUpvoteRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private NewsPaperServiceImpl newsPaperService;

    @Test
    void testGetGlobalNewsPapers_Success() {
        College college = new College();
        college.setName("Test College");

        Journalist journalist = new Journalist();
        journalist.setFullName("Test Journalist");

        NewsPaper np = new NewsPaper();
        np.setId(100L);
        np.setTitle("Global Headline");
        np.setContent("Some story");
        np.setCollege(college);
        np.setJournalist(journalist);

        GlobalNewsPaper global = new GlobalNewsPaper();
        global.setId(1L);
        global.setNewsPaper(np);
        global.setPublishedAt(LocalDateTime.now());

        when(globalNewsPaperRepository.findAllWithDetails()).thenReturn(List.of(global));
        when(authService.getCurrentUserId()).thenReturn(50L);
        when(globalNewsUpvoteRepository.countByIdGlobalNewsId(1L)).thenReturn(7L);
        when(globalNewsUpvoteRepository.existsByIdGlobalNewsIdAndIdUserId(1L, 50L)).thenReturn(true);

        List<NewsPaperResponseDto> result = newsPaperService.getGlobalNewsPapers();

        assertNotNull(result);
        assertEquals(1, result.size());
        NewsPaperResponseDto dto = result.get(0);
        assertEquals("Global Headline", dto.getTitle());
        assertEquals("Test Journalist", dto.getJournalistName());
        assertEquals("Test College", dto.getCollegeName());
        assertEquals(7L, dto.getUpvotesCount());
        assertTrue(dto.getIsUpvoted());
        assertTrue(dto.getIsGlobal());
    }
}
