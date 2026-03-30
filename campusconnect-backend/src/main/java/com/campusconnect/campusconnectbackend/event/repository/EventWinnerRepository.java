package com.campusconnect.campusconnectbackend.event.repository;

import com.campusconnect.campusconnectbackend.event.entity.EventWinner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventWinnerRepository extends JpaRepository<EventWinner, Long> {
    List<EventWinner> findAllByEvent_Id(Long eventId);

    void deleteAllByEvent_Id(Long eventId);
}
