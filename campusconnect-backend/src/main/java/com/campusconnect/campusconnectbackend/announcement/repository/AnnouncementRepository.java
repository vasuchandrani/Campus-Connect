package com.campusconnect.campusconnectbackend.announcement.repository;

import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement,Long> {

    @Query("""
        select a
        from Announcement a
        where a.club in :clubs
        order by a.createdAt desc
    """)
    List<Announcement> findAllByClubs(List<Club> clubs);

    List<Announcement> findByClub_IdOrderByCreatedAtDesc(Long clubId);

    @Query("""
        select a
        from Announcement a
        where a.club.id = :clubId
        order by a.createdAt desc
    """)
    List<Announcement> findLatestByClubId(
            Long clubId,
            Pageable pageable
    );

    boolean existsById(Long annId);

    void deleteById(Long annId);
}
