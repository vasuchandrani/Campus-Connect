package com.campusconnect.campusconnectbackend.journalist.service.serviceImpl;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.journalist.dto.req.JournalistRequestDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistReqResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistRequestService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class JournalistRequestServiceImpl implements JournalistRequestService {

    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final JournalistRequestRepository journalistRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailDispatcherService emailDispatcherService;
    private final StudentRepoService studentRepoService;

    private JournalistReqResponseDto getDto(JournalistRequest journalistRequest) {
        JournalistReqResponseDto dto = new JournalistReqResponseDto();
        if (journalistRequest == null) return dto;

        dto.setId(journalistRequest.getId());
        dto.setWhy(journalistRequest.getWhy());
        dto.setExperience(journalistRequest.getExperience());
        dto.setCollegeId(journalistRequest.getCollege().getId());
        dto.setStudentId(journalistRequest.getStudent().getStudentId());
        dto.setPortfolioLink(journalistRequest.getPortfolioLink());
        dto.setJournalistName(journalistRequest.getStudent().getFullName());
        dto.setStudentName(journalistRequest.getStudent().getFullName());
        dto.setStudentEmail(journalistRequest.getStudent().getEmail());

        return dto;
    }

    private List<JournalistReqResponseDto> getDtoList(List<JournalistRequest> journalistRequests) {
        List<JournalistReqResponseDto> response = new ArrayList<>();
        if (journalistRequests != null) {
            for (JournalistRequest journalistRequest : journalistRequests) {
                response.add(getDto(journalistRequest));
            }
        }
        return response;
    }

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_requests", allEntries = true),
    })
    public MessageResponseDto createJournalistRequest(JournalistRequestDto requestDto) {
        Long studentId = authService.getCurrentUserId();
        Student student = studentRepoService.getStudent(studentId);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You are not logged in");
        }

        if (journalistRepository.existsByStudent_Id(studentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are already an appointed campus journalist.");
        }
        if (journalistRequestRepository.existsByStudent_Id(studentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already submitted a journalist request. Your application is currently under review.");
        }

        College college = student.getCollege();

        JournalistRequest request = new JournalistRequest();
        request.setStudent(student);
        request.setCollege(college);
        request.setWhy(requestDto.getWhy());
        request.setExperience(requestDto.getExperience());
        request.setPortfolioLink(requestDto.getPortfolioLink());
        journalistRequestRepository.save(request);

        return new MessageResponseDto("Your journalist request has been sent successfully");
    }

    @Override
    @Cacheable(value = "journalist_requests", key = "'college_' + #collegeId", sync = true)
    public List<JournalistReqResponseDto> getJournalistRequests(Long collegeId) {
        List<JournalistRequest> requests = journalistRequestRepository.findAllByCollege_Id(collegeId);
        return getDtoList(requests);
    }

    @Override
    @Cacheable(value = "journalist_request", key = "#journalistRequestId", sync = true)
    public JournalistReqResponseDto getJournalistRequest(Long journalistRequestId) {
        JournalistRequest request = journalistRequestRepository.findById(journalistRequestId).orElseThrow(
                () -> new RuntimeException("Journalist Request not found")
        );
        return getDto(request);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalists", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "journalist_requests", allEntries = true),
            @CacheEvict(value = "journalist_request", key = "#journalistRequestId"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto acceptJournalistRequest(Long journalistRequestId) {
        String password = generatePassword();
        JournalistRequest request = journalistRequestRepository.findByIdWithStudentAndCollege(journalistRequestId)
                .or(() -> journalistRequestRepository.findById(journalistRequestId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journalist Request not found"));

        Student student = request.getStudent();
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found for journalist request");
        }

        if (journalistRepository.existsByStudent_Id(student.getId())) {
            journalistRequestRepository.delete(request);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request already accepted");
        }

        // Resolve student email before any deletion or state changes
        String studentEmail = student.getEmail();
        if ((studentEmail == null || studentEmail.isBlank()) && student.getUser() != null) {
            studentEmail = student.getUser().getEmail();
        }
        if ((studentEmail == null || studentEmail.isBlank()) && student.getId() != null) {
            try {
                Student dbStudent = studentRepoService.getStudent(student.getId());
                if (dbStudent != null) {
                    studentEmail = dbStudent.getEmail();
                }
            } catch (Exception e) {
                log.warn("Could not fetch student by id to resolve email: {}", e.getMessage());
            }
        }

        Journalist journalist = new Journalist();
        journalist.setFullName(student.getFullName());
        journalist.setPasswordHash(passwordEncoder.encode(password));
        journalist.setStudent(student);
        journalist.setCollege(request.getCollege());
        journalist.setActive(true);
        journalist.setPortfolioLink(request.getPortfolioLink());
        journalist.setAbout(request.getWhy());
        try {
            journalist.setAcceptedBy(authService.getCurrentUser());
        } catch (Exception ignored) {
        }
        journalistRepository.save(journalist);

        // Delete the request from the repository
        journalistRequestRepository.delete(request);

        // Send confirmation email with generated credentials
        if (studentEmail != null && !studentEmail.isBlank()) {
            try {
                JournalistAssignmentDto dto = new JournalistAssignmentDto();
                dto.setEmail(studentEmail.trim());
                dto.setPassword(password);
                dto.setDashboardLink("/campus-connect/journalist/dashboard");
                boolean sent = emailDispatcherService.sendJournalistRequestAccepted(dto);
                if (sent) {
                    log.info("Journalist acceptance email sent successfully to {}", studentEmail);
                } else {
                    log.error("EmailDispatcherService reported failure sending journalist acceptance email to {}", studentEmail);
                }
            } catch (Exception e) {
                log.error("Failed to send journalist acceptance email to {}: {}", studentEmail, e.getMessage(), e);
            }
        } else {
            log.error("Cannot send journalist acceptance email: student email could not be resolved for studentId {}", student.getId());
        }

        return new MessageResponseDto("Journalist Request accepted successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_requests", allEntries = true),
            @CacheEvict(value = "journalist_request", key = "#journalistRequestId"),
    })
    public MessageResponseDto rejectJournalistRequest(Long journalistRequestId) {
        if (!journalistRequestRepository.existsById(journalistRequestId)) {
            throw new RuntimeException("Journalist Request not found");
        }
        journalistRequestRepository.deleteById(journalistRequestId);

        return new MessageResponseDto("Journalist Request rejected successfully");
    }
}
