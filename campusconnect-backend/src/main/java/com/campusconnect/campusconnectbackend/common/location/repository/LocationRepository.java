package com.campusconnect.campusconnectbackend.common.location.repository;

import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByAddressAndCityAndStateAndCountry(
            String address, String city, String state, String country
    );
}
