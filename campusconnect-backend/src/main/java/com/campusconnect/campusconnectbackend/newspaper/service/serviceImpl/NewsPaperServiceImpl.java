package com.campusconnect.campusconnectbackend.newspaper.service.serviceImpl;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.newspaper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.newspaper.entity.NewsPaper;
import com.campusconnect.campusconnectbackend.newspaper.entity.NewsPaperImage;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperImageRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.newspaper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.newspaper.entity.GlobalNewsPaper;
import com.campusconnect.campusconnectbackend.newspaper.entity.GlobalNewsUpvote;
import com.campusconnect.campusconnectbackend.newspaper.entity.NewsUpvote;
import com.campusconnect.campusconnectbackend.newspaper.entity.id.GlobalNewsUpvoteId;
import com.campusconnect.campusconnectbackend.newspaper.entity.id.NewsUpvoteId;
import com.campusconnect.campusconnectbackend.newspaper.repository.GlobalNewsPaperRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.GlobalNewsUpvoteRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsUpvoteRepository;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.college_admin.repository.CollegeAdminRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsPaperServiceImpl implements NewsPaperService {

    private final NewsPaperRepository newsPaperRepository;
    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final CloudinaryService cloudinaryService;
    private final JournalistService journalistService;
    private final NewsUpvoteRepository newsUpvoteRepository;
    private final GlobalNewsPaperRepository globalNewsPaperRepository;
    private final GlobalNewsUpvoteRepository globalNewsUpvoteRepository;
    private final UserRepository userRepository;
    private final CollegeAdminRepository collegeAdminRepository;
    private final NewsPaperImageRepository newsPaperImageRepository;

    @Value("${NEWS_PAPER_DEFAULT:default.png}")
    private String newsPaperDefaultImage;

    private String getUploadedImageUrl(MultipartFile image, Long journalistId) {
        if (image == null || image.isEmpty()) {
            return newsPaperDefaultImage;
        }
        String path = "news_papers/" + journalistId;
        return cloudinaryService.uploadImage(image, path);
    }

    private List<String> processAndSaveImages(NewsPaper newsPaper, MultipartFile singleImage, List<MultipartFile> images, Long journalistId) {
        List<String> uploadedUrls = new ArrayList<>();
        String path = "news_papers/" + journalistId;

        if (images != null && !images.isEmpty()) {
            int count = 0;
            for (MultipartFile img : images) {
                if (img != null && !img.isEmpty() && count < 5) {
                    String url = cloudinaryService.uploadImage(img, path);
                    uploadedUrls.add(url);
                    NewsPaperImage npi = new NewsPaperImage();
                    npi.setNewsPaper(newsPaper);
                    npi.setImageUrl(url);
                    newsPaperImageRepository.save(npi);
                    count++;
                }
            }
        }

        if (uploadedUrls.isEmpty() && singleImage != null && !singleImage.isEmpty()) {
            String url = cloudinaryService.uploadImage(singleImage, path);
            uploadedUrls.add(url);
            NewsPaperImage npi = new NewsPaperImage();
            npi.setNewsPaper(newsPaper);
            npi.setImageUrl(url);
            newsPaperImageRepository.save(npi);
        }

        return uploadedUrls;
    }

    private String processAndSavePdf(MultipartFile pdf, Long journalistId) {
        if (pdf == null || pdf.isEmpty()) {
            return null;
        }
        if (pdf.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file exceeds 5MB limit");
        }
        String path = "news_papers/" + journalistId + "/pdf";
        return cloudinaryService.uploadPdf(pdf, path);
    }

    private NewsPaperResponseDto getDto(NewsPaper newsPaper) {
        NewsPaperResponseDto dto = new NewsPaperResponseDto();
        if (newsPaper == null) return dto;

        dto.setId(newsPaper.getId());
        dto.setTitle(newsPaper.getTitle());
        dto.setContent(newsPaper.getContent());
        dto.setImageUrl(newsPaper.getImageUrl());
        dto.setAbstractText(newsPaper.getAbstractText());
        dto.setPdfUrl(newsPaper.getPdfUrl());
        dto.setCreatedAt(newsPaper.getCreatedAt());
        dto.setStatus(newsPaper.getStatus() != null ? newsPaper.getStatus().name() : null);
        boolean isGloballyPublished = (newsPaper.getStatus() != null && "GLOBALLY_PUBLISHED".equals(newsPaper.getStatus().name()))
                || (newsPaper.getId() != null && globalNewsPaperRepository.existsByNewsPaper_Id(newsPaper.getId()));
        dto.setIsGlobal(isGloballyPublished);

        if (newsPaper.getJournalist() != null) {
            dto.setJournalistName(newsPaper.getJournalist().getFullName());
        }
        if (newsPaper.getCollege() != null) {
            dto.setCollegeName(newsPaper.getCollege().getName());
        }

        if (newsPaper.getId() != null) {
            dto.setUpvotesCount(newsUpvoteRepository.countByIdNewsId(newsPaper.getId()));
            try {
                Long currentUserId = authService.getCurrentUserId();
                if (currentUserId != null) {
                    dto.setIsUpvoted(newsUpvoteRepository.existsByIdNewsIdAndIdUserId(newsPaper.getId(), currentUserId));
                }
            } catch (Exception ignored) {}

            try {
                List<NewsPaperImage> imgs = newsPaperImageRepository.findAllByNewsPaper_Id(newsPaper.getId());
                if (imgs != null && !imgs.isEmpty()) {
                    dto.setImages(imgs.stream().map(NewsPaperImage::getImageUrl).toList());
                } else if (newsPaper.getImageUrl() != null && !newsPaper.getImageUrl().isBlank()) {
                    dto.setImages(List.of(newsPaper.getImageUrl()));
                }
            } catch (Exception ignored) {}
        }

        return dto;
    }

    private List<NewsPaperResponseDto> getDtoList(List<NewsPaper> newsPapers) {
        List<NewsPaperResponseDto> response = new ArrayList<>();
        if (newsPapers != null) {
            for (NewsPaper newsPaper : newsPapers) {
                response.add(getDto(newsPaper));
            }
        }
        return response;
    }

    @Override
    @Cacheable(value = "top_newsPapers", key = "'college_' + #collegeId", sync = true)
    public List<NewsPaperResponseDto> getTopNewsPaper(Long collegeId) {
        Pageable pageable = PageRequest.of(0, 4);
        List<NewsPaper> newsPapers = newsPaperRepository.findLatestByCollegeId(collegeId, "PUBLISHED", pageable);
        return getDtoList(newsPapers);
    }

    @Override
    @Cacheable(value = "latest_news", key = "'college_' + #collegeId", sync = true)
    public NewsPaperResponseDto getLatestOne(Long collegeId) {
        Pageable pageable = PageRequest.of(0, 1);
        NewsPaper news = newsPaperRepository
                .findLatestByCollegeId(collegeId, "PUBLISHED", pageable)
                .stream()
                .findFirst()
                .orElse(null);
        return getDto(news);
    }

    @Override
    @Cacheable(value = "college_newsPapers", key = "'college_' + #collegeId", sync = true)
    public List<NewsPaperResponseDto> getNewsPapersByCollege(Long collegeId) {
        List<NewsPaper> newsPapers = newsPaperRepository.findAllByCollege_IdAndStatus(collegeId, "PUBLISHED");
        return getDtoList(newsPapers);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "college_dashboard_stats", allEntries = true),
            @CacheEvict(value = "top_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "latest_news", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto unpublishNewsPaper(Long newsPaperId) {
        NewsPaper newsPaper = newsPaperRepository.findById(newsPaperId).orElseThrow(
                () -> new RuntimeException("newsPaper not found")
        );

        Long journalistId = newsPaper.getJournalist().getId();
        newsPaperImageRepository.deleteAllByNewsPaper_Id(newsPaperId);
        newsPaperRepository.delete(newsPaper);
        journalistService.evictJournalistCaches(journalistId);
        return new MessageResponseDto("News Paper Unpublished!");
    }

    @Override
    public int getNewsPapersCountByCollege(Long collegeId) {
        return newsPaperRepository.countByCollege_IdAndStatus(collegeId, "PUBLISHED");
    }

    @Override
    @Cacheable(value = "journalist_topNewsPapers", key = "#journalistId", sync = true)
    public List<NewsPaperResponseDto> getTopNewsPapers(Long journalistId) {
        Pageable page = PageRequest.of(0, 3);
        List<NewsPaper> newsPapers = newsPaperRepository.findTopNewsPapersByUpvotes(journalistId, page);
        return getDtoList(newsPapers);
    }

    @Override
    @Cacheable(value = "journalist_newsPapers", key = "#journalistId", sync = true)
    public List<NewsPaperResponseDto> getNewsPaperByJournalist(Long journalistId) {
        List<NewsPaper> list = newsPaperRepository.findAllByJournalist_IdAndStatus(journalistId, "PUBLISHED");
        return getDtoList(list);
    }

    @Override
    @Cacheable(value = "journalist_draftPapers", key = "#journalistId", sync = true)
    public List<NewsPaperResponseDto> getDraftPaperByJournalistId(Long journalistId) {
        List<NewsPaper> list = newsPaperRepository.findAllByJournalist_IdAndStatus(journalistId, "DRAFT");
        return getDtoList(list);
    }

    @Override
    public NewsPaperResponseDto getPublishedNewsPaper(Long paperId) {
        NewsPaper news = newsPaperRepository.findById(paperId).orElseThrow(
                () -> new RuntimeException("News Paper Not Found")
        );
        return getDto(news);
    }

    @Override
    @Transactional
    @CacheEvict(value = "journalist_draftPapers", key = "#journalistId")
    public MessageResponseDto createDraft(Long journalistId, NewsPaperRequestDto request, MultipartFile image) {
        return createDraft(journalistId, request, image, null, null);
    }

    @Override
    @Transactional
    @CacheEvict(value = "journalist_draftPapers", key = "#journalistId")
    public MessageResponseDto createDraft(Long journalistId, NewsPaperRequestDto request, MultipartFile image, List<MultipartFile> images, MultipartFile pdf) {
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist Not Found")
        );
        College college = journalist.getCollege();

        NewsPaper newsPaper = new NewsPaper();
        newsPaper.setTitle(request.getTitle());
        newsPaper.setContent(request.getContent());
        newsPaper.setAbstractText(request.getAbstractText());
        newsPaper.setImageUrl(newsPaperDefaultImage);
        newsPaper.setStatus("DRAFT");
        newsPaper.setJournalist(journalist);
        newsPaper.setCollege(college);

        newsPaper = newsPaperRepository.save(newsPaper);

        List<String> uploadedImages = processAndSaveImages(newsPaper, image, images, journalistId);
        if (!uploadedImages.isEmpty()) {
            newsPaper.setImageUrl(uploadedImages.get(0));
        }

        String pdfUrl = processAndSavePdf(pdf, journalistId);
        if (pdfUrl != null) {
            newsPaper.setPdfUrl(pdfUrl);
        }
        newsPaperRepository.save(newsPaper);

        return new MessageResponseDto("Draft saved Successfully");
    }

    @Override
    @Transactional
    @CacheEvict(value = "journalist_draftPapers", key = "#journalistId")
    public MessageResponseDto updateDraft(Long journalistId, Long draftId, NewsPaperRequestDto request, MultipartFile image) {
        return updateDraft(journalistId, draftId, request, image, null, null);
    }

    @Override
    @Transactional
    @CacheEvict(value = "journalist_draftPapers", key = "#journalistId")
    public MessageResponseDto updateDraft(Long journalistId, Long draftId, NewsPaperRequestDto request, MultipartFile image, List<MultipartFile> images, MultipartFile pdf) {
        NewsPaper draftNewsPaper = newsPaperRepository.findById(draftId).orElseThrow(
                () -> new RuntimeException("Draft Not Found")
        );

        if (request.getTitle() != null) {
            draftNewsPaper.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            draftNewsPaper.setContent(request.getContent());
        }
        if (request.getAbstractText() != null) {
            draftNewsPaper.setAbstractText(request.getAbstractText());
        }

        if ((images != null && !images.isEmpty()) || (image != null && !image.isEmpty())) {
            newsPaperImageRepository.deleteAllByNewsPaper_Id(draftId);
            List<String> uploaded = processAndSaveImages(draftNewsPaper, image, images, journalistId);
            if (!uploaded.isEmpty()) {
                draftNewsPaper.setImageUrl(uploaded.get(0));
            }
        }

        if (pdf != null && !pdf.isEmpty()) {
            String pdfUrl = processAndSavePdf(pdf, journalistId);
            draftNewsPaper.setPdfUrl(pdfUrl);
        }

        newsPaperRepository.save(draftNewsPaper);
        return new MessageResponseDto("Draft Modified Successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_draftPapers", key = "@authService.getCurrentUserId()")
    })
    public MessageResponseDto deleteDraft(Long draftId) {
        if (!newsPaperRepository.existsById(draftId)) {
            throw new RuntimeException("Draft Not Found");
        }
        newsPaperImageRepository.deleteAllByNewsPaper_Id(draftId);
        newsPaperRepository.deleteById(draftId);
        return new MessageResponseDto("Draft Deleted Successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "top_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "latest_news", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto publishDraftPaper(Long draftId) {
        NewsPaper draftNewsPaper = newsPaperRepository.findById(draftId).orElseThrow(
                () -> new RuntimeException("Draft Not Found")
        );
        draftNewsPaper.setStatus("PUBLISHED");
        draftNewsPaper.setState(1);
        newsPaperRepository.save(draftNewsPaper);

        journalistService.evictJournalistCaches(authService.getCurrentUserId());
        return new MessageResponseDto("Draft Published Successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_newsPapers", key = "@authService.getCurrentUserId()"),
            @CacheEvict(value = "journalist_topNewsPapers", key = "@authService.getCurrentUserId()"),
            @CacheEvict(value = "journalist_dashboard_stats", key = "@authService.getCurrentUserId()"),
            @CacheEvict(value = "top_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "latest_news", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto publishNewspaper(NewsPaperRequestDto request, MultipartFile image) {
        return publishNewspaper(request, image, null, null);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalist_newsPapers", key = "@authService.getCurrentUserId()"),
            @CacheEvict(value = "journalist_topNewsPapers", key = "@authService.getCurrentUserId()"),
            @CacheEvict(value = "journalist_dashboard_stats", key = "@authService.getCurrentUserId()"),
            @CacheEvict(value = "top_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "latest_news", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_newsPapers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true)
    })
    public MessageResponseDto publishNewspaper(NewsPaperRequestDto request, MultipartFile image, List<MultipartFile> images, MultipartFile pdf) {
        Long journalistId = authService.getCurrentUserId();
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist Not Found")
        );
        College college = journalist.getCollege();

        NewsPaper newsPaper = new NewsPaper();
        newsPaper.setContent(request.getContent());
        newsPaper.setTitle(request.getTitle());
        newsPaper.setAbstractText(request.getAbstractText());
        newsPaper.setImageUrl(newsPaperDefaultImage);
        newsPaper.setStatus("PUBLISHED");
        newsPaper.setState(1);
        newsPaper.setCollege(college);
        newsPaper.setJournalist(journalist);

        newsPaper = newsPaperRepository.save(newsPaper);

        List<String> uploadedImages = processAndSaveImages(newsPaper, image, images, journalistId);
        if (!uploadedImages.isEmpty()) {
            newsPaper.setImageUrl(uploadedImages.get(0));
        }

        String pdfUrl = processAndSavePdf(pdf, journalistId);
        if (pdfUrl != null) {
            newsPaper.setPdfUrl(pdfUrl);
        }
        newsPaperRepository.save(newsPaper);

        return new MessageResponseDto("News-Paper Published!");
    }

    @Override
    @Transactional(readOnly = true)
    public List<NewsPaperResponseDto> getGlobalNewsPapers() {
        List<GlobalNewsPaper> globalList = globalNewsPaperRepository.findAllWithDetails();
        List<NewsPaperResponseDto> response = new ArrayList<>();
        Long currentUserId = null;
        try {
            currentUserId = authService.getCurrentUserId();
        } catch (Exception ignored) {}

        for (GlobalNewsPaper g : globalList) {
            NewsPaperResponseDto dto = new NewsPaperResponseDto();
            dto.setId(g.getId());
            dto.setTitle(g.getTitle());
            dto.setContent(g.getContent());
            dto.setImageUrl(g.getImageUrl());
            if (g.getNewsPaper() != null) {
                dto.setAbstractText(g.getNewsPaper().getAbstractText());
                dto.setPdfUrl(g.getNewsPaper().getPdfUrl());
            }
            dto.setCreatedAt(g.getCreatedAt());
            dto.setStatus("PUBLISHED");
            dto.setIsGlobal(true);
            if (g.getJournalist() != null) {
                dto.setJournalistName(g.getJournalist().getFullName());
            }
            if (g.getCollege() != null) {
                dto.setCollegeName(g.getCollege().getName());
            }
            dto.setUpvotesCount(globalNewsUpvoteRepository.countByIdGlobalNewsId(g.getId()));
            if (currentUserId != null) {
                dto.setIsUpvoted(globalNewsUpvoteRepository.existsByIdGlobalNewsIdAndIdUserId(g.getId(), currentUserId));
            }
            response.add(dto);
        }
        return response;
    }

    @Override
    @Transactional
    public MessageResponseDto toggleUpvote(Long newsPaperId, Long userId) {
        if (newsUpvoteRepository.existsByIdNewsIdAndIdUserId(newsPaperId, userId)) {
            newsUpvoteRepository.deleteByIdNewsIdAndIdUserId(newsPaperId, userId);
            return new MessageResponseDto("Upvote removed");
        } else {
            NewsPaper newsPaper = newsPaperRepository.findById(newsPaperId)
                    .orElseThrow(() -> new RuntimeException("Newspaper article not found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            NewsUpvote upvote = new NewsUpvote();
            upvote.setId(new NewsUpvoteId(newsPaperId, userId));
            upvote.setNewsPaper(newsPaper);
            upvote.setUser(user);
            newsUpvoteRepository.save(upvote);
            return new MessageResponseDto("Upvoted successfully");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto toggleGlobalUpvote(Long globalNewsPaperId, Long userId) {
        if (globalNewsUpvoteRepository.existsByIdGlobalNewsIdAndIdUserId(globalNewsPaperId, userId)) {
            globalNewsUpvoteRepository.deleteByIdGlobalNewsIdAndIdUserId(globalNewsPaperId, userId);
            return new MessageResponseDto("Upvote removed");
        } else {
            GlobalNewsPaper globalPaper = globalNewsPaperRepository.findById(globalNewsPaperId)
                    .orElseThrow(() -> new RuntimeException("Global newspaper article not found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            GlobalNewsUpvote upvote = new GlobalNewsUpvote();
            upvote.setId(new GlobalNewsUpvoteId(globalNewsPaperId, userId));
            upvote.setGlobalNewsPaper(globalPaper);
            upvote.setUser(user);
            globalNewsUpvoteRepository.save(upvote);
            return new MessageResponseDto("Upvoted successfully");
        }
    }

    @Override
    public List<NewsPaperResponseDto> getCampusNewspapers(Long collegeId) {
        List<NewsPaper> list = newsPaperRepository.findCampusNewsPapers(collegeId);
        return getDtoList(list);
    }

    @Override
    public List<NewsPaperResponseDto> getPendingGlobalRequests() {
        List<NewsPaper> list = newsPaperRepository.findPendingGlobalRequests();
        return getDtoList(list);
    }

    @Override
    @Transactional
    public MessageResponseDto approveGlobalNewsPaper(Long newsPaperId, Long adminUserId) {
        NewsPaper newsPaper = newsPaperRepository.findById(newsPaperId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Newspaper not found")
        );
        newsPaper.setStatus("GLOBALLY_PUBLISHED");
        newsPaperRepository.save(newsPaper);

        if (!globalNewsPaperRepository.existsByNewsPaper_Id(newsPaperId)) {
            CollegeAdmin admin = null;
            if (adminUserId != null) {
                admin = collegeAdminRepository.findByUser_Id(adminUserId).orElse(null);
            }
            if (admin == null && newsPaper.getCollege() != null) {
                admin = collegeAdminRepository.findFirstByCollege_Id(newsPaper.getCollege().getId()).orElse(null);
            }

            if (admin != null) {
                GlobalNewsPaper globalNewsPaper = new GlobalNewsPaper();
                globalNewsPaper.setNewsPaper(newsPaper);
                globalNewsPaper.setPublishedBy(admin);
                globalNewsPaperRepository.save(globalNewsPaper);
            }
        }

        return new MessageResponseDto("Newspaper published globally successfully!");
    }

    @Override
    @Transactional
    public MessageResponseDto rejectGlobalNewsPaper(Long newsPaperId) {
        NewsPaper newsPaper = newsPaperRepository.findById(newsPaperId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Newspaper not found")
        );
        newsPaper.setStatus("APPROVED");
        newsPaperRepository.save(newsPaper);
        return new MessageResponseDto("Globalization request rejected. Kept as campus published.");
    }

    @Override
    @Transactional
    public MessageResponseDto requestGlobalNewsPaper(Long newsPaperId) {
        NewsPaper newsPaper = newsPaperRepository.findById(newsPaperId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Newspaper not found")
        );
        newsPaper.setStatus("GLOBALIZATION_REQUESTED");
        newsPaperRepository.save(newsPaper);
        return new MessageResponseDto("Globalization requested successfully!");
    }
}
