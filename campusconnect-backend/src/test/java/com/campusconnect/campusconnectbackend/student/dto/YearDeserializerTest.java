package com.campusconnect.campusconnectbackend.student.dto;

import com.campusconnect.campusconnectbackend.student.dto.req.StudentRegisterRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class YearDeserializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testDeserializeOrdinalString() throws Exception {
        String json = "{\"id\":\"CS101\",\"fullName\":\"John Doe\",\"email\":\"john@test.com\",\"gender\":\"MALE\",\"department\":\"CS\",\"year\":\"1st\"}";
        StudentRegisterRequestDto dto = objectMapper.readValue(json, StudentRegisterRequestDto.class);
        assertEquals(1, dto.getYear());
    }

    @Test
    void testDeserializeSecondYearString() throws Exception {
        String json = "{\"id\":\"CS102\",\"fullName\":\"Jane Doe\",\"email\":\"jane@test.com\",\"gender\":\"FEMALE\",\"department\":\"CS\",\"year\":\"2nd\"}";
        StudentRegisterRequestDto dto = objectMapper.readValue(json, StudentRegisterRequestDto.class);
        assertEquals(2, dto.getYear());
    }

    @Test
    void testDeserializeThirdYearWithText() throws Exception {
        String json = "{\"id\":\"CS103\",\"fullName\":\"Alice\",\"email\":\"alice@test.com\",\"gender\":\"FEMALE\",\"department\":\"CS\",\"year\":\"3rd Year\"}";
        StudentRegisterRequestDto dto = objectMapper.readValue(json, StudentRegisterRequestDto.class);
        assertEquals(3, dto.getYear());
    }

    @Test
    void testDeserializeNumericInteger() throws Exception {
        String json = "{\"id\":\"CS104\",\"fullName\":\"Bob\",\"email\":\"bob@test.com\",\"gender\":\"MALE\",\"department\":\"CS\",\"year\":4}";
        StudentRegisterRequestDto dto = objectMapper.readValue(json, StudentRegisterRequestDto.class);
        assertEquals(4, dto.getYear());
    }

    @Test
    void testDeserializeBatchYear() throws Exception {
        String json = "{\"id\":\"CS105\",\"fullName\":\"Charlie\",\"email\":\"charlie@test.com\",\"gender\":\"MALE\",\"department\":\"CS\",\"year\":\"2024\"}";
        StudentRegisterRequestDto dto = objectMapper.readValue(json, StudentRegisterRequestDto.class);
        assertEquals(2024, dto.getYear());
    }
}
