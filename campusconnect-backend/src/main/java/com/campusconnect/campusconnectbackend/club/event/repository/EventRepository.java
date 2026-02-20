package com.campusconnect.campusconnectbackend.club.event.repository;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {


    @Query("""
        select count(e)
        from Event e
        where e.club in :clubs
          and e.status = :status
    """)
    int countEventsByClubsAndStatus(List<Club> clubs, String status);

    @Query("""
        select e
        from Event e
        where e.club in :clubs
          and e.status = 'LIVE'
        order by e.eventDate asc, e.createdAt asc
    """)
    List<Event> findLiveEvents(
            List<Club> clubs,
            Pageable pageable
    );

    @Query("""
        select e
        from Event e
        where e.club in :clubs
          and e.status = 'UPCOMING'
          and e.eventDate >= CURRENT_DATE
        order by e.eventDate asc, e.createdAt asc
    """)
    List<Event> findUpcomingEvents(
            List<Club> clubs,
            Pageable pageable
    );

    List<Event> findEventByClub_Id(Long clubId);

    Optional<Event> findEventById(Long id);

    @Query("""
        select e
        from Event e
        where e.club.id = :clubId
          and e.status = 'LIVE'
        order by e.eventDate asc, e.createdAt asc
    """)
    List<Event> findLiveEventsByClub(Long clubId, Pageable livePage);

    @Query("""
        select e
        from Event e
        where e.club.id = :clubId
          and e.status = 'UPCOMING'
        order by e.eventDate asc, e.createdAt asc
    """)
    List<Event> findUpcomingEventsByClub(Long clubId, Pageable upcomingPage);

    int countEventsByClub_IdAndStatus(Long clubId, String status);

    List<Event> findByStatusInAndClubIn(Collection<String> statuses, Collection<Club> clubs);

    Collection<String> club(Club club);

    List<Event> findByClubAndStatusIn(Club club, Collection<String> statuses);
}