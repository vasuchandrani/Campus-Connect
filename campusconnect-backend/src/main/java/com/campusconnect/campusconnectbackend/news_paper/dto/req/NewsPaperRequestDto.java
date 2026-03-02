package com.campusconnect.campusconnectbackend.news_paper.dto.req;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewsPaperRequestDto {

    private String title;

    private String content;

    private String imageUrl;

}
