package com.campusconnect.campusconnectbackend.college.repository;


import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CollegeSubscriptionRepository extends JpaRepository<CollegeSubscription, Long> {
    @Query("""
        SELECT cs
        FROM CollegeSubscription cs
        WHERE cs.college.id = :collegeId
        AND cs.startDate <= :now
        AND cs.endDate >= :now
    """)
    Optional<CollegeSubscription> findActiveSubscription(Long collegeId, LocalDateTime now);

    List<CollegeSubscription> findAllByCollege_Id(Long collegeId);
}