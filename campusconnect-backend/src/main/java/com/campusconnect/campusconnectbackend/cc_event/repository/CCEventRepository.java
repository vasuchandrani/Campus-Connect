package com.campusconnect.campusconnectbackend.cc_event.repository;

import com.campusconnect.campusconnectbackend.cc_event.entity.CCEvent;
import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CCEventRepository extends JpaRepository<CCEvent, Long> {
    List<CCEvent> findAllByStatusOrderByStartTimeAsc(CCEventStatus status);
}
