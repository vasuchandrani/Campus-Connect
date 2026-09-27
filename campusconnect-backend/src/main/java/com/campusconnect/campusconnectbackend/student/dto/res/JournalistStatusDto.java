package com.campusconnect.campusconnectbackend.student.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalistStatusDto {

    private boolean isJournalist;

    private Long journalistId;

    private boolean hasPendingRequest;

    public JournalistStatusDto(boolean isJournalist, Long journalistId) {
        this.isJournalist = isJournalist;
        this.journalistId = journalistId;
        this.hasPendingRequest = false;
    }
}
