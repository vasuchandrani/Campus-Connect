package com.campusconnect.campusconnectbackend.college.dto.res;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class CollegeSubscriptionResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String planName;

    private int amount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String adminName;

    private String adminEmail;

    private String paymentId;

    private String orderId;

    private String invoiceUrl;
}
