package com.campusconnect.campusconnectbackend.event.dto.req;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyEventPaymentDto {

    private Long eventId;

    private Long planId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    // Dynamic registration form data filled by student
    private JsonNode registrationData;
}
