package com.campusconnect.campusconnectbackend.newspaper.repository;

import com.campusconnect.campusconnectbackend.newspaper.entity.GlobalNewsPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GlobalNewsPaperRepository extends JpaRepository<GlobalNewsPaper, Long> {

    @Query("SELECT g FROM GlobalNewsPaper g " +
           "LEFT JOIN FETCH g.newsPaper np " +
           "LEFT JOIN FETCH np.journalist j " +
           "LEFT JOIN FETCH np.college c " +
           "ORDER BY g.publishedAt DESC")
    List<GlobalNewsPaper> findAllWithDetails();

    List<GlobalNewsPaper> findAllByOrderByPublishedAtDesc();

    boolean existsByNewsPaper_Id(Long newsPaperId);

    Optional<GlobalNewsPaper> findByNewsPaper_Id(Long newsPaperId);

    int countByNewsPaper_Journalist_Id(Long journalistId);
}
