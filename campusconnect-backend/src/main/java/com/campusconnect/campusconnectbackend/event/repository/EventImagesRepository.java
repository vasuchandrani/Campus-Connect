package com.campusconnect.campusconnectbackend.event.repository;

import com.campusconnect.campusconnectbackend.event.entity.EventImages;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventImagesRepository extends JpaRepository<EventImages, Long> {
    List<EventImages> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);
}
