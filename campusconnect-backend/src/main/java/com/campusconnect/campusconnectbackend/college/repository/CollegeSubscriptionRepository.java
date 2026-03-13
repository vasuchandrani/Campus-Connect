package com.campusconnect.campusconnectbackend.college.repository;


import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollegeSubscriptionRepository extends JpaRepository<CollegeSubscription, Long> {
    CollegeSubscription findByCollege_Id(Long collegeId);
}
