package com.campusconnect.campusconnectbackend.newspaper.repository;

import com.campusconnect.campusconnectbackend.newspaper.entity.NewsPaperImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsPaperImageRepository extends JpaRepository<NewsPaperImage, Long> {
    List<NewsPaperImage> findAllByNewsPaper_Id(Long newsPaperId);
    void deleteAllByNewsPaper_Id(Long newsPaperId);
}
