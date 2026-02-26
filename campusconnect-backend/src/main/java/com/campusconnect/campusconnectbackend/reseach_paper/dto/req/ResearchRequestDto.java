package com.campusconnect.campusconnectbackend.reseach_paper.dto.req;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResearchRequestDto {

    private String title;

    private String content;

    private String subject;

    private String imageUrl;
}
