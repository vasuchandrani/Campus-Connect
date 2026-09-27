package com.campusconnect.campusconnectbackend.common.location.service;

import com.campusconnect.campusconnectbackend.common.location.dto.LocationRequestDto;
import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import com.campusconnect.campusconnectbackend.common.location.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    /**
     * Find an existing Location by all fields, or create a new one.
     * Prevents duplicate locations in the database.
     */
    public Location findOrCreateLocation(LocationRequestDto dto) {
        if (dto == null) return null;

        return locationRepository.findByAddressAndCityAndStateAndCountry(
                dto.getAddress(), dto.getCity(), dto.getState(), dto.getCountry()
        ).orElseGet(() -> {
            Location location = new Location();
            location.setAddress(dto.getAddress());
            location.setCity(dto.getCity());
            location.setState(dto.getState());
            location.setCountry(dto.getCountry());
            return locationRepository.save(location);
        });
    }

    /**
     * Find a location by ID.
     */
    public Location findById(Long id) {
        return locationRepository.findById(id).orElse(null);
    }
}
