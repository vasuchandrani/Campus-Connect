package com.campusconnect.campusconnectbackend.professor.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.req.AddProfRequestDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfDetailResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfStatsResponseDto;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;

import java.util.List;

public interface ProfessorService {
    ProfResponseDto getDto(Professor professor);
    List<ProfResponseDto> getDtoList(List<Professor> professors);
    MessageResponseDto store(AddProfRequestDto request);
    String getName(Long professorId);
    List<ProfResponseDto> getProfessors(Long collegeId);
    MessageResponseDto removeProfessor(Long professorId);
    MessageResponseDto assignProfessor(Long id, Long professorId);
    ProfStatsResponseDto getStats(Long professorId);
    ProfDetailResponseDto getDetails(Long professorId);
    java.util.List<java.util.Map<String, Object>> getActiveClubs(Long collegeId, Long profId);
    java.util.List<java.util.Map<String, Object>> getMentoredClubs(Long profId);
}
