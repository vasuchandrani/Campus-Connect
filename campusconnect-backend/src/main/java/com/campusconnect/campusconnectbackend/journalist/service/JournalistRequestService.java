package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRequestRepository;
import com.campusconnect.campusconnectbackend.mail_service.dto.journalist.JournalistAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistRequestService {


    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final JournalistRequestRepository journalistRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailDispatcherService emailDispatcherService;

    // get all journalist request made from the college
    public List<JournalistRequest> getJournalistRequests() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();

        return journalistRequestRepository.findAllByCollege_Id(collegeId);
    }

    // get particular journalist request
    public JournalistRequest getJournalistRequest(Long id) {
        return journalistRequestRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Journalist Request with id " + id + " not found")
        );
    }

    // accept journalist request
    public boolean acceptJournalistRequest(Long id, String password) {
        try {
            // find request
            JournalistRequest request = getJournalistRequest(id);
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
    public boolean rejectJournalistRequest(Long id) {
        try {
            // find journalist request
            JournalistRequest request = getJournalistRequest(id);
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
