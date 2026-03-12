package com.campusconnect.campusconnectbackend.research_paper.dto.req;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResearchRequestDto {

    private String title;

    private String overview;

    private String subject;

    private String dept;
}
