package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.response.journalist.JournalistReqResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistRequestService {


    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final JournalistRequestRepository journalistRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailDispatcherService emailDispatcherService;

    // get DTO
    private JournalistReqResponseDto getDto(JournalistRequest journalistRequest) {
        // create dto
        JournalistReqResponseDto dto =  new JournalistReqResponseDto();
        // map the data
        dto.setId(journalistRequest.getId());
        dto.setWhy(journalistRequest.getWhy());
        dto.setExperience(journalistRequest.getExperience());
        dto.setCollegeId(journalistRequest.getCollege().getId());
        dto.setStudentId(journalistRequest.getStudent().getId());
        dto.setPortfolioLink(journalistRequest.getPortfolioLink());

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

    // get all journalist request made from the college
    public List<JournalistReqResponseDto> getJournalistRequests() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        // find all journalist-requests
        List<JournalistRequest> requests = journalistRequestRepository.findAllByCollege_Id(collegeId);

        return getDtoList(requests);
    }

    // get particular journalist request
    public JournalistReqResponseDto getJournalistRequest(Long id) {
        JournalistRequest request = journalistRequestRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Journalist Request with id " + id + " not found")
        );

        return getDto(request);
    }

    // accept journalist request
    @Transactional
    public boolean acceptJournalistRequest(Long id, String password) {
        try {
            // find request
            JournalistRequest request = journalistRequestRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Journalist Request with id " + id + " not found")
            );
            // create
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

            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // reject journalist request
    @Transactional
    public boolean rejectJournalistRequest(Long id) {
        try {
            // find journalist request
            JournalistRequest request = journalistRequestRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Journalist Request with id " + id + " not found")
            );
            // delete
            journalistRequestRepository.delete(request);
            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }
}
