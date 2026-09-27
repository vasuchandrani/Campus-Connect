package com.campusconnect.campusconnectbackend.newspaper.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class NewsPaperResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String imageUrl;

    private String abstractText;

    private String pdfUrl;

    private List<String> images = new ArrayList<>();

    @NotBlank
    private String status;

    @NotNull
    private LocalDateTime createdAt;

    @NotBlank
    private String journalistName;

    @NotBlank
    private String collegeName;

    private Long upvotesCount = 0L;

    private Boolean isUpvoted = false;

    private Boolean isGlobal = false;
}
