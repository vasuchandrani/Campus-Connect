package com.campusconnect.campusconnectbackend.reviewer.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ReviewerDetailResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String reviewerName;

    private String collegeName;
}
