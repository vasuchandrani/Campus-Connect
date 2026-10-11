package com.campusconnect.campusconnectbackend.common.location.controller;

import com.campusconnect.campusconnectbackend.common.location.entity.City;
import com.campusconnect.campusconnectbackend.common.location.entity.Country;
import com.campusconnect.campusconnectbackend.common.location.entity.State;
import com.campusconnect.campusconnectbackend.common.location.repository.CityRepository;
import com.campusconnect.campusconnectbackend.common.location.repository.CountryRepository;
import com.campusconnect.campusconnectbackend.common.location.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    @GetMapping("/countries")
    public ResponseEntity<List<String>> getCountries() {
        return ResponseEntity
                .ok(countryRepository.findAll().stream().map(Country::getName).collect(Collectors.toList()));
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates(@RequestParam String country) {
        return ResponseEntity.ok(
                stateRepository.findByCountryName(country).stream().map(State::getName).collect(Collectors.toList()));
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities(@RequestParam String state) {
        return ResponseEntity
                .ok(cityRepository.findByStateName(state).stream().map(City::getName).collect(Collectors.toList()));
    }
}
