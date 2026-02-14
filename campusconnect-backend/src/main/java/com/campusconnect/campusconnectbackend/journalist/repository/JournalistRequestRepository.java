package com.campusconnect.campusconnectbackend.journalist.repository;

import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalistRequestRepository extends JpaRepository<JournalistRequest, Long> {
    List<JournalistRequest> findAllByCollege_Id(Long collegeId);
}
