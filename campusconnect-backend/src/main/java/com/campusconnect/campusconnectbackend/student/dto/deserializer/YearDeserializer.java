package com.campusconnect.campusconnectbackend.student.dto.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Robust deserializer that handles numeric values, numeric strings ("1"),
 * ordinal strings ("1st", "2nd"), and year numbers ("2024").
 */
public class YearDeserializer extends JsonDeserializer<Integer> {

    @Override
    public Integer deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.trim().isEmpty()) {
            return 1;
        }
        String digits = text.replaceAll("[^0-9]", "");
        if (!digits.isEmpty()) {
            try {
                return Integer.parseInt(digits);
            } catch (NumberFormatException e) {
                return 1;
            }
        }
        return 1;
    }
}
