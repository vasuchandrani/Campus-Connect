package com.campusconnect.campusconnectbackend.research_paper.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ResearchesResponseDto {

    private Long id;

    private String title;

    private String overview;

    private String subject;

    private String pdfUrl;

    private String status;

    private String reviewerFeedback;

    private LocalDateTime createdAt;

    private Long reviewerId;

    private Long studentId;
}
