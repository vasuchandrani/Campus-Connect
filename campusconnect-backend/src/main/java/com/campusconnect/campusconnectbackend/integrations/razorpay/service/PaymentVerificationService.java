package com.campusconnect.campusconnectbackend.integrations.razorpay.service;

import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentVerificationService {

    @Value("${razorpay.api.secret}")
    private String secret;

    public void verifyPayment(String orderId, String paymentId, String signature) throws Exception {

        JSONObject params = new JSONObject();

        params.put("razorpay_order_id", orderId);
        params.put("razorpay_payment_id", paymentId);
        params.put("razorpay_signature", signature);

        boolean isValid = Utils.verifyPaymentSignature(params, secret);

        if (!isValid) {
            throw new RuntimeException("Payment verification failed");
        }
    }
}