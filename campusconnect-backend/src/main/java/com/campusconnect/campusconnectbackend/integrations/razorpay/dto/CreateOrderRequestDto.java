package com.campusconnect.campusconnectbackend.integrations.razorpay.dto;

import lombok.Data;

@Data
public class CreateOrderRequestDto {

    private int amount;
    private String currency;
}