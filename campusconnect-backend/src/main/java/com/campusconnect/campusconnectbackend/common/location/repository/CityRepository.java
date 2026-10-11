package com.campusconnect.campusconnectbackend.common.location.repository;

import com.campusconnect.campusconnectbackend.common.location.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByStateName(String stateName);
}
