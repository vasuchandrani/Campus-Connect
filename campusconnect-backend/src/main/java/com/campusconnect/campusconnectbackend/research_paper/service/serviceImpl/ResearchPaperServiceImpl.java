package com.campusconnect.campusconnectbackend.research_paper.service.serviceImpl;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.professor.dto.req.ProfRequestDto;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository;
import com.campusconnect.campusconnectbackend.research_paper.dto.req.ResearchRequestDto;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchPaper;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchPaperRepository;
import com.campusconnect.campusconnectbackend.research_paper.service.ResearchPaperService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import com.campusconnect.campusconnectbackend.research_paper.entity.GlobalResearchPaper;
import com.campusconnect.campusconnectbackend.research_paper.entity.GlobalResearchPaperUpvote;
import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchUpvote;
import com.campusconnect.campusconnectbackend.research_paper.entity.id.GlobalResearchPaperUpvoteId;
import com.campusconnect.campusconnectbackend.research_paper.entity.id.ResearchUpvoteId;
import com.campusconnect.campusconnectbackend.research_paper.repository.GlobalResearchPaperRepository;
import com.campusconnect.campusconnectbackend.research_paper.repository.GlobalResearchPaperUpvoteRepository;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchUpvoteRepository;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.college_admin.repository.CollegeAdminRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResearchPaperServiceImpl implements ResearchPaperService {

    private final ResearchPaperRepository researchPaperRepository;
    private final StudentRepoService studentRepoService;
    private final ProfessorRepository professorRepository;
    private final CloudinaryService cloudinaryService;
    private final RedisTemplate<Object, Object> redisTemplate;
    private final AuthService authService;
    private final ResearchUpvoteRepository researchUpvoteRepository;
    private final GlobalResearchPaperRepository globalResearchPaperRepository;
    private final GlobalResearchPaperUpvoteRepository globalResearchPaperUpvoteRepository;
    private final UserRepository userRepository;
    private final CollegeAdminRepository collegeAdminRepository;
    private final StudentRepository studentRepository;

    private ResearchesResponseDto getDto(ResearchPaper paper) {
        ResearchesResponseDto dto = new ResearchesResponseDto();
        if (paper == null) return dto;

        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setOverview(paper.getOverview());
        dto.setPdfUrl(paper.getPdfUrl());
        dto.setWebsiteUrl(paper.getWebsiteUrl());
        dto.setStatus(paper.getStatus() != null ? paper.getStatus().name() : null);
        dto.setSubject(paper.getSubject());
        dto.setDepartment(paper.getDepartment());
        dto.setCreatedAt(paper.getCreatedAt());
        boolean isGloballyPublished = (paper.getStatus() != null && "GLOBALLY_PUBLISHED".equals(paper.getStatus().name()))
                || (paper.getId() != null && globalResearchPaperRepository.existsByResearchPaper_Id(paper.getId()));
        dto.setIsGlobal(isGloballyPublished);

        if (paper.getCollege() != null) {
            dto.setCollegeName(paper.getCollege().getName());
        }

        if (paper.getProfessor() != null) {
            dto.setProfessorId(paper.getProfessor().getId());
            dto.setProfessorName(paper.getProfessor().getFullName());
            if (paper.getProfessor().getUser() != null) {
                dto.setProfessorEmail(paper.getProfessor().getUser().getEmail());
            }
        }
        if (paper.getProfFeedback() != null) {
            dto.setProfessorFeedback(paper.getProfFeedback());
        }
        if (paper.getUser() != null) {
            User authorUser = paper.getUser();
            Student studentAuthor = studentRepository.findByUser_Id(authorUser.getId()).orElse(null);
            if (studentAuthor != null) {
                dto.setStudentId(studentAuthor.getStudentId());
                dto.setStudentName(studentAuthor.getFullName());
            } else {
                Professor profAuthor = professorRepository.findByUser_Id(authorUser.getId()).orElse(null);
                if (profAuthor != null) {
                    dto.setProfessorId(profAuthor.getId());
                    dto.setProfessorName(profAuthor.getFullName());
                    if (profAuthor.getUser() != null) {
                        dto.setProfessorEmail(profAuthor.getUser().getEmail());
                    }
                }
            }
        }

        if (paper.getId() != null) {
            dto.setUpvotesCount(researchUpvoteRepository.countByIdResearchId(paper.getId()));
            try {
                Long currentUserId = authService.getCurrentUserId();
                if (currentUserId != null) {
                    dto.setIsUpvoted(researchUpvoteRepository.existsByIdResearchIdAndIdUserId(paper.getId(), currentUserId));
                }
            } catch (Exception ignored) {}
        }

        return dto;
    }

    private List<ResearchesResponseDto> getDtoList(List<ResearchPaper> papers) {
        List<ResearchesResponseDto> response = new ArrayList<>();
        if (papers != null) {
            for (ResearchPaper paper : papers) {
                response.add(getDto(paper));
            }
        }
        return response;
    }

    private void evictMyResearchesByStudent(Long studentId) {
        String key = "campusconnect::myResearches::student_" + studentId;
        redisTemplate.delete(key);
    }

    @Override
    @Cacheable(value = "myResearches", key = "'student_' + #studentId", sync = true)
    public List<ResearchesResponseDto> getMyResearchPapers(Long studentId) {
        Student student = studentRepoService.getStudent(studentId);
        List<ResearchPaper> papers = researchPaperRepository.findAllByUser_Id(student.getUser().getId());
        return getDtoList(papers);
    }

    @Override
    @Cacheable(value = "research_papers", key = "'college_' + #collegeId", sync = true)
    public List<ResearchesResponseDto> getAllResearchPapers(Long collegeId) {
        List<ResearchPaper> papers = researchPaperRepository.findCampusResearches(collegeId);
        return getDtoList(papers);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "myResearches", key = "'student_' + #studentId"),
            @CacheEvict(value = "not_reviewed_researches", key = "'college_' + @authService.getCurrentCollegeId()")
    })
    public MessageResponseDto submitPaper(ResearchRequestDto request, MultipartFile pdf, Long studentId) {
        Student student = studentRepoService.getStudent(studentId);
        College college = student.getCollege();

        String path = "Research_papers" + studentId;
        String pdfUrl = cloudinaryService.uploadPdf(pdf, path);

        ResearchPaper paper = new ResearchPaper();
        paper.setTitle(request.getTitle());
        paper.setOverview(request.getOverview());
        paper.setSubject(request.getSubject());
        paper.setDepartment(request.getDept());
        paper.setPdfUrl(pdfUrl);
        paper.setWebsiteUrl(request.getWebsite());
        paper.setUser(student.getUser());
        paper.setCollege(college);
        paper.setStatus("NOT_REVIEWED");
        paper.setState(0);

        researchPaperRepository.save(paper);
        return new MessageResponseDto("Your Research Paper has been submitted");
    }

    @Override
    @Cacheable(value = "not_reviewed_researches", key = "'college_' + #collegeId", sync = true)
    public List<ResearchesResponseDto> getNotReviewedResearches(Long collegeId) {
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatus(collegeId, "NOT REVIEWED");
        return getDtoList(papers);
    }

    @Override
    @Cacheable(value = "under_review_researches", key = "'college_' + #collegeId", sync = true)
    public List<ResearchesResponseDto> getUnderReviewedResearches(Long collegeId) {
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatus(collegeId, "UNDER REVIEW");
        return getDtoList(papers);
    }

    @Override
    @Cacheable(value = "reviewed_researches", key = "'college_' + #collegeId", sync = true)
    public List<ResearchesResponseDto> getReviewedResearches(Long collegeId) {
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatusIn(collegeId, List.of("ACCEPTED", "REJECTED"));
        return getDtoList(papers);
    }

    @Override
    public ResearchesResponseDto getResearchPaper(Long id) {
        ResearchPaper research = researchPaperRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );
        return getDto(research);
    }

    @Override
    @Cacheable(value = "pending_researches", key = "'professor_' + #professorId", sync = true)
    public List<ResearchesResponseDto> getAllPendingByProfessor(Long professorId) {
        List<ResearchPaper> researches = researchPaperRepository.findAllByProfessor_IdAndStatus(professorId, "UNDER REVIEW");
        return getDtoList(researches);
    }

    @Override
    @Cacheable(value = "reviewed_researches", key = "'professor_' + #professorId", sync = true)
    public List<ResearchesResponseDto> getAllReviewedByProfessor(Long professorId) {
        List<ResearchPaper> researches = researchPaperRepository.findAllByProfessor_IdAndStatusIn(professorId, List.of("ACCEPTED", "REJECTED"));
        return getDtoList(researches);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "research_papers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "under_review_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "reviewed_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "pending_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "reviewed_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "professor_stats", key = "#professorId"),
    })
    public MessageResponseDto acceptResearch(Long researchId, ProfRequestDto request, Long professorId) {
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );
        ResearchPaper research = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );

        research.setProfessor(professor);
        research.setProfFeedback(request.getFeedback());
        research.setStatus("ACCEPTED");
        research.setState(1);

        researchPaperRepository.save(research);

        if (research.getUser() != null) {
            Student authorStudent = studentRepository.findByUser_Id(research.getUser().getId()).orElse(null);
            if (authorStudent != null) {
                evictMyResearchesByStudent(authorStudent.getId());
                studentRepoService.evictStudentResearchCaches(authorStudent.getId());
            }
        }

        return new MessageResponseDto("Research-Paper has been accepted & published");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "under_review_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "reviewed_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "pending_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "reviewed_researches", key = "'professor_' + #professorId"),
            @CacheEvict(value = "professor_stats", key = "#professorId"),
    })
    public MessageResponseDto rejectResearch(Long researchId, ProfRequestDto request, Long professorId) {
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );
        ResearchPaper research = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );

        research.setProfessor(professor);
        research.setProfFeedback(request.getFeedback());
        research.setStatus("REJECTED");
        research.setState(2);

        researchPaperRepository.save(research);

        if (research.getUser() != null) {
            Student authorStudent = studentRepository.findByUser_Id(research.getUser().getId()).orElse(null);
            if (authorStudent != null) {
                evictMyResearchesByStudent(authorStudent.getId());
                studentRepoService.evictStudentResearchCaches(authorStudent.getId());
            }
        }

        return new MessageResponseDto("Research-Paper has been rejected");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResearchesResponseDto> getGlobalResearchPapers() {
        List<GlobalResearchPaper> globalList = globalResearchPaperRepository.findAllWithDetails();
        List<ResearchesResponseDto> response = new ArrayList<>();
        Long currentUserId = null;
        try {
            currentUserId = authService.getCurrentUserId();
        } catch (Exception ignored) {}

        for (GlobalResearchPaper g : globalList) {
            ResearchesResponseDto dto = new ResearchesResponseDto();
            dto.setId(g.getId());
            dto.setTitle(g.getTitle());
            dto.setOverview(g.getOverview());
            dto.setPdfUrl(g.getPdfUrl());
            dto.setStatus("published");
            dto.setSubject(g.getSubject());
            dto.setDepartment(g.getDepartment());
            dto.setCreatedAt(g.getCreatedAt());
            dto.setIsGlobal(true);
            if (g.getCollege() != null) {
                dto.setCollegeName(g.getCollege().getName());
            }
            if (g.getUser() != null) {
                Student studentAuthor = studentRepository.findByUser_Id(g.getUser().getId()).orElse(null);
                if (studentAuthor != null) {
                    dto.setStudentId(studentAuthor.getStudentId());
                    dto.setStudentName(studentAuthor.getFullName());
                } else {
                    Professor profAuthor = professorRepository.findByUser_Id(g.getUser().getId()).orElse(null);
                    if (profAuthor != null) {
                        dto.setProfessorId(profAuthor.getId());
                        dto.setProfessorName(profAuthor.getFullName());
                    }
                }
            }
            dto.setUpvotesCount(globalResearchPaperUpvoteRepository.countByIdGlobalResearchPaperId(g.getId()));
            if (currentUserId != null) {
                dto.setIsUpvoted(globalResearchPaperUpvoteRepository.existsByIdGlobalResearchPaperIdAndIdUserId(g.getId(), currentUserId));
            }
            response.add(dto);
        }
        return response;
    }

    @Override
    @Transactional
    public MessageResponseDto toggleUpvote(Long researchPaperId, Long userId) {
        if (researchUpvoteRepository.existsByIdResearchIdAndIdUserId(researchPaperId, userId)) {
            researchUpvoteRepository.deleteByIdResearchIdAndIdUserId(researchPaperId, userId);
            return new MessageResponseDto("Upvote removed");
        } else {
            ResearchPaper paper = researchPaperRepository.findById(researchPaperId)
                    .orElseThrow(() -> new RuntimeException("Research paper not found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ResearchUpvote upvote = new ResearchUpvote();
            upvote.setId(new ResearchUpvoteId(researchPaperId, userId));
            upvote.setResearchPaper(paper);
            upvote.setUser(user);
            researchUpvoteRepository.save(upvote);
            return new MessageResponseDto("Upvoted successfully");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto toggleGlobalUpvote(Long globalResearchPaperId, Long userId) {
        if (globalResearchPaperUpvoteRepository.existsByIdGlobalResearchPaperIdAndIdUserId(globalResearchPaperId, userId)) {
            globalResearchPaperUpvoteRepository.deleteByIdGlobalResearchPaperIdAndIdUserId(globalResearchPaperId, userId);
            return new MessageResponseDto("Upvote removed");
        } else {
            GlobalResearchPaper paper = globalResearchPaperRepository.findById(globalResearchPaperId)
                    .orElseThrow(() -> new RuntimeException("Global research paper not found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            GlobalResearchPaperUpvote upvote = new GlobalResearchPaperUpvote();
            upvote.setId(new GlobalResearchPaperUpvoteId(globalResearchPaperId, userId));
            upvote.setGlobalResearchPaper(paper);
            upvote.setUser(user);
            globalResearchPaperUpvoteRepository.save(upvote);
            return new MessageResponseDto("Upvoted successfully");
        }
    }

    @Override
    public List<ResearchesResponseDto> getCampusResearches(Long collegeId) {
        List<ResearchPaper> list = researchPaperRepository.findCampusResearches(collegeId);
        return getDtoList(list);
    }

    @Override
    public List<ResearchesResponseDto> getPendingGlobalRequests() {
        List<ResearchPaper> list = researchPaperRepository.findPendingGlobalRequests();
        return getDtoList(list);
    }

    @Override
    @Transactional
    public MessageResponseDto approveGlobalResearch(Long researchId, Long adminUserId) {
        ResearchPaper paper = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Research paper not found")
        );
        paper.setStatus("GLOBALLY_PUBLISHED");
        researchPaperRepository.save(paper);

        if (!globalResearchPaperRepository.existsByResearchPaper_Id(researchId)) {
            CollegeAdmin admin = null;
            if (adminUserId != null) {
                admin = collegeAdminRepository.findByUser_Id(adminUserId).orElse(null);
            }
            if (admin == null && paper.getCollege() != null) {
                admin = collegeAdminRepository.findFirstByCollege_Id(paper.getCollege().getId()).orElse(null);
            }

            if (admin != null) {
                GlobalResearchPaper globalPaper = new GlobalResearchPaper();
                globalPaper.setResearchPaper(paper);
                globalPaper.setPublishedBy(admin);
                globalResearchPaperRepository.save(globalPaper);
            }
        }

        return new MessageResponseDto("Research paper published globally successfully!");
    }

    @Override
    @Transactional
    public MessageResponseDto rejectGlobalResearch(Long researchId) {
        ResearchPaper paper = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Research paper not found")
        );
        paper.setStatus("APPROVED");
        researchPaperRepository.save(paper);
        return new MessageResponseDto("Globalization request rejected. Kept as campus published.");
    }

    @Override
    @Transactional
    public MessageResponseDto requestGlobalResearch(Long researchId) {
        ResearchPaper paper = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Research paper not found")
        );
        paper.setStatus("GLOBALIZATION_REQUESTED");
        researchPaperRepository.save(paper);
        return new MessageResponseDto("Globalization requested successfully!");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "research_papers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "professor_stats", key = "#professorId")
    })
    public MessageResponseDto submitProfessorPaper(ResearchRequestDto request, MultipartFile pdf, Long professorId) {
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );
        College college = professor.getCollege();

        String path = "Research_papers_prof_" + professorId;
        String pdfUrl = cloudinaryService.uploadPdf(pdf, path);

        ResearchPaper paper = new ResearchPaper();
        paper.setTitle(request.getTitle());
        paper.setOverview(request.getOverview());
        paper.setSubject(request.getSubject());
        paper.setDepartment(request.getDept());
        paper.setPdfUrl(pdfUrl);
        paper.setWebsiteUrl(request.getWebsite());
        paper.setUser(professor.getUser());
        paper.setProfessor(professor);
        paper.setCollege(college);
        paper.setStatus("PROFESSOR_SUBMITTED");
        paper.setState(1);

        researchPaperRepository.save(paper);
        return new MessageResponseDto("Your Research Paper has been directly published within the college");
    }

    @Override
    public List<ResearchesResponseDto> getMyProfessorResearches(Long professorId) {
        Professor professor = professorRepository.findById(professorId).orElseThrow(
                () -> new RuntimeException("Professor not found")
        );
        List<ResearchPaper> papers = researchPaperRepository.findByAuthorUserId(professor.getUser().getId());
        return getDtoList(papers);
    }
}
