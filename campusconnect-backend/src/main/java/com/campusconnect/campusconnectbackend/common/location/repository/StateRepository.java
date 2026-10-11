package com.campusconnect.campusconnectbackend.common.location.repository;

import com.campusconnect.campusconnectbackend.common.location.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StateRepository extends JpaRepository<State, Long> {
    List<State> findByCountryName(String countryName);
}
