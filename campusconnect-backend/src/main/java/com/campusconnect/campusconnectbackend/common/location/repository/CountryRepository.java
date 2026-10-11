package com.campusconnect.campusconnectbackend.common.location.repository;

import com.campusconnect.campusconnectbackend.common.location.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CountryRepository extends JpaRepository<Country, Long> {
}
