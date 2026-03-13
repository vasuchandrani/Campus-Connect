package com.campusconnect.campusconnectbackend.integrations.razorpay.dto;

import lombok.Data;

@Data
public class CreateOrderRequestDto {

    private long amount;
    private String currency;
}