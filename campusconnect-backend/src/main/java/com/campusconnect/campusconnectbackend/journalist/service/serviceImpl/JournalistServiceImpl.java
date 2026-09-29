package com.campusconnect.campusconnectbackend.journalist.service.serviceImpl;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import com.campusconnect.campusconnectbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JournalistServiceImpl implements JournalistService {

    private final JournalistRepository journalistRepository;
    private final NewsPaperRepository newsPaperRepository;
    private final AuthService authService;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailDispatcherService emailDispatcherService;
    private final JournalistRequestRepository journalistRequestRepository;
    private final UserRepository userRepository;
    private final com.campusconnect.campusconnectbackend.newspaper.repository.GlobalNewsPaperRepository globalNewsPaperRepository;

    private JournalistResponseDto getDto(Journalist journalist) {
        JournalistResponseDto dto = new JournalistResponseDto();
        if (journalist == null) return dto;

        dto.setId(journalist.getId());
        dto.setFullName(journalist.getFullName());
        dto.setName(journalist.getFullName());
        dto.setActive(journalist.isActive());
        dto.setCreatedAt(journalist.getCreatedAt());
        if (journalist.getCollege() != null) {
            dto.setCollegeId(journalist.getCollege().getId());
        }
        if (journalist.getStudent() != null) {
            dto.setStudentId(journalist.getStudent().getStudentId());
            dto.setDepartment(journalist.getStudent().getDepartment());
            dto.setBatchYear(journalist.getStudent().getBatchYear());
            dto.setEmail(journalist.getStudent().getEmail());
        }

        return dto;
    }

    private List<JournalistResponseDto> getDtoList(List<Journalist> journalists) {
        List<JournalistResponseDto> response = new ArrayList<>();
        if (journalists != null) {
            for (Journalist journalist : journalists) {
                response.add(getDto(journalist));
            }
        }
        return response;
    }

    @Override
    public int getJournalistsCountByCollege(Long collegeId) {
        return journalistRepository.countByCollege_Id(collegeId);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "journalist_topNewsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_newsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_draftPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_dashboard_stats", key = "#journalistId")
    })
    public void evictJournalistCaches(Long journalistId) {}

    @Override
    @Cacheable(value = "journalists", key = "'college_' + #collegeId", sync = true)
    public List<JournalistResponseDto> getJournalists(Long collegeId) {
        List<Journalist> journalists = journalistRepository.findAllByCollege_Id(collegeId);
        return getDtoList(journalists);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalists", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "journalist_details", key = "#journalistId"),
            @CacheEvict(value = "journalist_topNewsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_newsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_draftPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_dashboard_stats", key = "#journalistId"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true),
    })
    public MessageResponseDto removeJournalist(Long journalistId) {
        if (!journalistRepository.existsById(journalistId)) {
            throw new RuntimeException("Journalist not found!");
        }
        journalistRepository.deleteById(journalistId);
        return new MessageResponseDto("Journalist has been removed successfully!");
    }

    @Override
    @Cacheable(value = "journalist_dashboard_stats", key = "#journalistId", sync = true)
    public JournalistStatResponseDto getStat(Long journalistId) {
        int newsPaperCnt = newsPaperRepository.countByJournalist_IdAndStatus(journalistId, "PUBLISHED");
        int draftCnt = newsPaperRepository.countByJournalist_IdAndStatus(journalistId, "DRAFT");
        int globalCnt = globalNewsPaperRepository.countByNewsPaper_Journalist_Id(journalistId);

        JournalistStatResponseDto dto = new JournalistStatResponseDto();
        dto.setDraft(draftCnt);
        dto.setPublished(newsPaperCnt);
        dto.setGlobalized(globalCnt);
        return dto;
    }

    @Override
    @Cacheable(value = "journalist_details", key = "#journalistId", sync = true)
    public JournalistDetailResponseDto getDetails(Long journalistId) {
        Journalist j = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist not found")
        );

        JournalistDetailResponseDto dto = new JournalistDetailResponseDto();
        dto.setName(j.getFullName());
        if (j.getCollege() != null) {
            dto.setCollegeName(j.getCollege().getName());
        }
        if (j.getStudent() != null) {
            dto.setEmail(j.getStudent().getEmail());
        }
        return dto;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalists", key = "'college_' + #collegeId"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto addJournalistByEmail(String email, Long collegeId, Long adminUserId) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student with email " + email + " not found"));

        if (student.getCollege() == null || !student.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student does not belong to your college");
        }

        if (journalistRepository.existsByStudent_Id(student.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student is already assigned as a journalist");
        }

        journalistRequestRepository.findByStudent_Id(student.getId())
                .ifPresent(journalistRequestRepository::delete);

        String rawPassword = UUID.randomUUID().toString().substring(0, 8);

        Journalist journalist = new Journalist();
        journalist.setFullName(student.getFullName());
        journalist.setPasswordHash(passwordEncoder.encode(rawPassword));
        journalist.setStudent(student);
        journalist.setCollege(student.getCollege());
        journalist.setActive(true);
        if (adminUserId != null) {
            userRepository.findById(adminUserId).ifPresent(journalist::setAcceptedBy);
        }

        journalistRepository.save(journalist);

        try {
            JournalistAssignmentDto dto = new JournalistAssignmentDto();
            dto.setEmail(student.getEmail());
            dto.setPassword(rawPassword);
            dto.setDashboardLink("/campus-connect/journalist/dashboard");
            emailDispatcherService.sendJournalistRequestAccepted(dto);
        } catch (Exception ignored) {
            // Logged/ignored to ensure transaction succeeds
        }

        return new MessageResponseDto("Journalist assigned successfully! Login password has been emailed to the student.");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalists", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto toggleJournalistActive(Long journalistId) {
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journalist not found")
        );
        boolean newStatus = !journalist.isActive();
        journalist.setActive(newStatus);
        journalistRepository.save(journalist);
        String action = newStatus ? "activated" : "deactivated";
        return new MessageResponseDto("Journalist successfully " + action + "!");
    }
}
