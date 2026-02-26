package com.campusconnect.campusconnectbackend.reseach_paper.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ResearchesResponseDto {

    private Long id;

    private String title;

    private String content;

    private String subject;

    private String imageUrl;

    private String status;

    private String reviewerFeedback;

    private LocalDateTime createdAt;

    private Long reviewerId;

    private Long studentId;
}
