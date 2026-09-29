package com.campusconnect.campusconnectbackend.professor.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.professor.ProfessorAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.professor.dto.req.AddProfRequestDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfDetailResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfStatsResponseDto;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository;
import com.campusconnect.campusconnectbackend.professor.service.ProfessorService;
import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchPaper;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfessorServiceImpl implements ProfessorService {
    private final ProfessorRepository professorRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final CollegeService collegeService;
    private final EmailDispatcherService emailDispatcherService;
    private final ResearchPaperRepository researchPaperRepository;
    private final StudentRepoService studentRepoService;
    private final ClubRepository clubRepository;
    private final StudentRepository studentRepository;
    private final com.campusconnect.campusconnectbackend.college.repository.DepartmentRepository departmentRepository;
    private final com.campusconnect.campusconnectbackend.club.club_mentor.repository.ClubMentorRepository clubMentorRepository;
    private final com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService clubFollowerService;

    @Override
    public ProfResponseDto getDto(Professor professor) {
        ProfResponseDto dto = new ProfResponseDto();
        if (professor == null) return dto;

        dto.setId(professor.getId());
        dto.setFullName(professor.getFullName());
        dto.setEmail(professor.getEmail());
        dto.setAbout(professor.getAbout());
        dto.setCreatedAt(professor.getCreatedAt());
        if (professor.getDepartment() != null) {
            dto.setDepartment(professor.getDepartment().getName());
            dto.setDepartmentId(professor.getDepartment().getId());
        } else if (professor.getAbout() != null && !professor.getAbout().isBlank()) {
            dto.setDepartment(professor.getAbout());
        }
        if (professor.getCollege() != null) {
            dto.setCollegeId(professor.getCollege().getId());
        }
        try {
            int mentored = clubRepository.countByMentor_Id(professor.getId());
            dto.setMentoredClubsCount(mentored);
        } catch (Exception ignored) {}
        try {
            int reviewed = researchPaperRepository.countByProfessor_IdAndStatusIn(
                    professor.getId(),
                    List.of("ACCEPTED", "REJECTED", "APPROVED", "UNDER REVIEW")
            );
            dto.setReviewedPapersCount(reviewed);
        } catch (Exception ignored) {}

        return dto;
    }

    @Override
    public List<ProfResponseDto> getDtoList(List<Professor> professors) {
        List<ProfResponseDto> response = new ArrayList<>();
        if (professors != null) {
            for (Professor professor : professors) {
                response.add(getDto(professor));
            }
        }
        return response;
    }

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    @Transactional
    @CacheEvict(value = "professors", key = "'college_' + @authService.getCurrentCollegeId()")
    public MessageResponseDto store(AddProfRequestDto request) {
        String password = generatePassword();
        Long collegeId = authService.getCurrentCollegeId();
        College college = collegeService.getCollegeById(collegeId);

        Professor professor = new Professor();
        professor.setFullName(request.getFullName());
        professor.setEmail(request.getEmail());
        professor.setPasswordHash(passwordEncoder.encode(password));
        professor.setCollege(college);
        String deptName = (request.getDepartment() != null && !request.getDepartment().isBlank())
                ? request.getDepartment().trim()
                : "General";

        com.campusconnect.campusconnectbackend.college.entity.Department dept =
                departmentRepository.findByCollege_IdAndNameIgnoreCase(college.getId(), deptName)
                        .orElseGet(() -> departmentRepository.findByCollege_IdAndNameIgnoreCase(college.getId(), "General")
                                .orElseGet(() -> {
                                    com.campusconnect.campusconnectbackend.college.entity.Department gen =
                                            new com.campusconnect.campusconnectbackend.college.entity.Department(college, "General", "GEN");
                                    return departmentRepository.save(gen);
                                }));

        professor.setDepartment(dept);
        professor.setAbout(request.getAbout() != null ? request.getAbout() : "");

        professorRepository.save(professor);

        ProfessorAssignmentDto dto = new ProfessorAssignmentDto();
        dto.setEmail(request.getEmail());
        dto.setPassword(password);
        dto.setDashboardLink("/campus-connect/professor/dashboard");
        emailDispatcherService.sendProfessorAssigned(dto);

        return new MessageResponseDto("Professor added successfully");
    }

    @Override
    @Cacheable(value = "professor_name", key = "#professorId", sync = true)
    public String getName(Long professorId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return professor.getFullName();
    }

    @Override
    public List<ProfResponseDto> getProfessors(Long collegeId) {
        List<Professor> professor = professorRepository.findAllByCollege_Id(collegeId);
        return getDtoList(professor);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "professor_name", key = "#professorId"),
            @CacheEvict(value = "professor_stats", key = "#professorId"),
            @CacheEvict(value = "professor_details", key = "#professorId"),
            @CacheEvict(value = "pending_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "reviewed_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "professors", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto removeProfessor(Long professorId) {
        if (!professorRepository.existsById(professorId)) {
            throw new RuntimeException("Professor not found!");
        }
        professorRepository.deleteById(professorId);

        return new MessageResponseDto("Professor removed successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "research_papers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "not_reviewed_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "under_review_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "pending_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "professor_stats", key = "#professorId"),
    })
    public MessageResponseDto assignProfessor(Long id, Long professorId) {
        ResearchPaper paper = researchPaperRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );

        paper.setProfessor(professor);
        paper.setStatus("UNDER REVIEW");
        researchPaperRepository.save(paper);

        if (paper.getUser() != null) {
            studentRepository.findByUser_Id(paper.getUser().getId())
                    .ifPresent(s -> studentRepoService.evictStudentResearchCaches(s.getId()));
        }

        return new MessageResponseDto("Professor assigned successfully");
    }

    @Override
    @Cacheable(value = "professor_stats", key = "#professorId", sync = true)
    public ProfStatsResponseDto getStats(Long professorId) {
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );

        int pending = researchPaperRepository.countByProfessor_IdAndStatus(professorId, "UNDER REVIEW");
        int reviewed = researchPaperRepository.countByProfessor_IdAndStatusIn(professorId, List.of("ACCEPTED", "REJECTED", "APPROVED"));
        int mentoredClubs = clubRepository.countByMentor_Id(professorId);
        int myResearches = 0;
        if (professor.getUser() != null) {
            myResearches = researchPaperRepository.countByUser_Id(professor.getUser().getId());
        }

        ProfStatsResponseDto stats = new ProfStatsResponseDto();
        stats.setPendingReviews(pending);
        stats.setReviewed(reviewed);
        stats.setMentoredClubs(mentoredClubs);
        stats.setMyResearches(myResearches);

        return stats;
    }

    @Override
    @Cacheable(value = "professor_details", key = "#professorId", sync = true)
    public ProfDetailResponseDto getDetails(Long professorId) {
        Professor p = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );

        ProfDetailResponseDto dto = new ProfDetailResponseDto();
        dto.setProfessorName(p.getFullName());
        if (p.getCollege() != null) {
            dto.setCollegeName(p.getCollege().getName());
        }
        if (p.getDepartment() != null) {
            dto.setDepartmentName(p.getDepartment().getName());
            dto.setDepartmentId(p.getDepartment().getId());
        } else if (p.getAbout() != null && !p.getAbout().isBlank()) {
            dto.setDepartmentName(p.getAbout());
        }
        return dto;
    }

    @Override
    public List<java.util.Map<String, Object>> getActiveClubs(Long collegeId, Long profId) {
        List<Long> mentoredClubIds = clubMentorRepository.findClubIdsByProfessorId(profId);
        java.util.Set<Long> mentoredSet = new java.util.HashSet<>(mentoredClubIds != null ? mentoredClubIds : java.util.Collections.emptyList());

        List<com.campusconnect.campusconnectbackend.club.entity.Club> clubs = clubRepository.findAllByCollege_Id(collegeId);
        List<java.util.Map<String, Object>> list = new ArrayList<>();
        for (com.campusconnect.campusconnectbackend.club.entity.Club c : clubs) {
            if (c.isActive()) {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("tagline1", c.getTagline1());
                map.put("tagline2", c.getTagline2());
                map.put("description", c.getDescription());
                map.put("logoUrl", c.getLogoUrl());
                map.put("website", c.getWebsite());
                map.put("foundedBy", c.getFoundedBy());
                boolean isMentor = (c.getMentor() != null && java.util.Objects.equals(c.getMentor().getId(), profId)) || mentoredSet.contains(c.getId());
                map.put("isMentor", isMentor);
                map.put("mentorName", c.getMentor() != null ? c.getMentor().getFullName() : null);
                map.put("adminName", c.getAdmin() != null ? c.getAdmin().getFullName() : null);
                map.put("isFollowed", clubFollowerService.isFollowing(c.getId()));
                map.put("followerCount", clubFollowerService.getFollowerCount(c.getId()));
                list.add(map);
            }
        }
        return list;
    }

    @Override
    public List<java.util.Map<String, Object>> getMentoredClubs(Long profId) {
        java.util.Set<com.campusconnect.campusconnectbackend.club.entity.Club> mentoredClubs = new java.util.LinkedHashSet<>(clubRepository.findAllByMentor_Id(profId));
        List<Long> extraClubIds = clubMentorRepository.findClubIdsByProfessorId(profId);
        if (extraClubIds != null && !extraClubIds.isEmpty()) {
            mentoredClubs.addAll(clubRepository.findAllById(extraClubIds));
        }

        List<java.util.Map<String, Object>> list = new ArrayList<>();
        for (com.campusconnect.campusconnectbackend.club.entity.Club c : mentoredClubs) {
            if (c.isActive()) {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("tagline1", c.getTagline1());
                map.put("tagline2", c.getTagline2());
                map.put("description", c.getDescription());
                map.put("logoUrl", c.getLogoUrl());
                map.put("website", c.getWebsite());
                map.put("isActive", c.isActive());
                map.put("foundedBy", c.getFoundedBy());
                map.put("createdAt", c.getCreatedAt());
                map.put("adminName", c.getAdmin() != null ? c.getAdmin().getFullName() : null);
                list.add(map);
            }
        }
        return list;
    }
}
