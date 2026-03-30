package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.req.JournalistRequestDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistReqResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JournalistRequestService {

    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final JournalistRequestRepository journalistRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailDispatcherService emailDispatcherService;
    private final StudentRepoService studentRepoService;

    // get DTO
    private JournalistReqResponseDto getDto(JournalistRequest journalistRequest) {
        // create dto
        JournalistReqResponseDto dto =  new JournalistReqResponseDto();
        if (journalistRequest == null) return dto;

        // map the data
        dto.setId(journalistRequest.getId());
        dto.setWhy(journalistRequest.getWhy());
        dto.setExperience(journalistRequest.getExperience());
        dto.setCollegeId(journalistRequest.getCollege().getId());
        dto.setStudentId(journalistRequest.getStudent().getStudentId());
        dto.setPortfolioLink(journalistRequest.getPortfolioLink());
        dto.setJournalistName(journalistRequest.getStudent().getFullName());

        return dto;
    }

    // get DTO -list
    private List<JournalistReqResponseDto> getDtoList(List<JournalistRequest> journalistRequests) {
        // create response
        List<JournalistReqResponseDto> response = new ArrayList<>();

        for (JournalistRequest journalistRequest : journalistRequests) {
            response.add(getDto(journalistRequest));
        }
        return response;
    }

    // generate password
    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    /* Student */

    // become a journalist request sent by student
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_requests", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto createJournalistRequest(JournalistRequestDto requestDto) {
        // find student
        Long studentId = authService.getCurrentUserId();
        Student student = studentRepoService.getStudent(studentId);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You are not logged in");
        }

        // check if student is already a journalist
        if (journalistRepository.existsById(studentId)) {
            return new MessageResponseDto("You are already Journalist");
        }
        // check if student is already requested for journalist
        if (journalistRequestRepository.existsById(studentId)) {
            return new MessageResponseDto("You have been already submitted journalist request");
        }

        // find college
        College college =  student.getCollege();

        // create
        JournalistRequest request = new JournalistRequest();
        request.setStudent(student);
        request.setCollege(college);
        request.setWhy(requestDto.getWhy());
        request.setExperience(requestDto.getExperience());
        request.setPortfolioLink(requestDto.getPortfolioLink());
        // save in db
        journalistRequestRepository.save(request);

        return new MessageResponseDto("Your journalist request has been sent successfully");
    }

    /* College-Admin */

    // get all journalist request made from the college
    @Cacheable(value = "journalist_requests", key = "'college_' + #collegeId", sync = true)
    public List<JournalistReqResponseDto> getJournalistRequests(Long collegeId) {

        // find all journalist-requests
        List<JournalistRequest> requests = journalistRequestRepository.findAllByCollege_Id(collegeId);

        return getDtoList(requests);
    }

    // get particular journalist request
    @Cacheable(value = "journalist_request", key = "#journalistRequestId", sync = true)
    public JournalistReqResponseDto getJournalistRequest(Long journalistRequestId) {

        JournalistRequest request = journalistRequestRepository.findById(journalistRequestId).orElseThrow(
                () -> new RuntimeException("Journalist Request not found")
        );

        return getDto(request);
    }

    // accept journalist request
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalists", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "journalist_requests", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "journalist_request", key = "#journalistRequestId"),
            @CacheEvict(value = "college_dashboard_stats", key = "@authService.getCurrentCollegeId()")
    })
    public MessageResponseDto acceptJournalistRequest(Long journalistRequestId) {
        // generate password
        String password = generatePassword();
        // find request
        JournalistRequest request = journalistRequestRepository.findById(journalistRequestId).orElseThrow(
                () -> new RuntimeException("Journalist Request not found")
        );

        // check if student is already a journalist
        if (journalistRepository.existsById(request.getStudent().getId())) {
            // delete journalist request
            journalistRequestRepository.delete(request);
            throw new RuntimeException("Request already accepted");
        }

        // create journalist
        Journalist journalist = new Journalist();
        journalist.setFullName(request.getStudent().getFullName());
        journalist.setPasswordHash(passwordEncoder.encode(password));
        journalist.setStudent(request.getStudent());
        journalist.setCollege(request.getCollege());
        // save in db
        journalistRepository.save(journalist);

        // delete journalist request
        journalistRequestRepository.delete(request);

        // send mail to student
        JournalistAssignmentDto dto = new JournalistAssignmentDto();
        dto.setEmail(request.getStudent().getEmail());
        dto.setPassword(password);
        dto.setDashboardLink("/campus-connect/journalist/dashboard");
        emailDispatcherService.sendJournalistRequestAccepted(dto);

        return new MessageResponseDto("Journalist Request accepted successfully");
    }

    // reject journalist request
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_requests", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "journalist_request", key = "#journalistRequestId"),
    })
    public MessageResponseDto rejectJournalistRequest(Long journalistRequestId) {

        // check if exist
        if (!journalistRequestRepository.existsById(journalistRequestId)) {
            throw new RuntimeException("Journalist Request not found");
        }
        // delete
        journalistRequestRepository.deleteById(journalistRequestId);

        return new MessageResponseDto("Journalist Request rejected successfully");
    }
}
