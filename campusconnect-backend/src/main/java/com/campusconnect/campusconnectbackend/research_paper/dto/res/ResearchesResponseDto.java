package com.campusconnect.campusconnectbackend.research_paper.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class ResearchesResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String title;

    private String overview;

    private String subject;

    private String pdfUrl;

    private String websiteUrl;

    private String status;

    private String department;

    private String professorFeedback;

    private LocalDateTime createdAt;

    private Long professorId;

    private String studentId;

    private String studentName;

    private String professorName;

    private String professorEmail;

    private String collegeName;

    private Long upvotesCount = 0L;

    private Boolean isUpvoted = false;

    private Boolean isGlobal = false;
}
