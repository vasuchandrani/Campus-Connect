package com.campusconnect.campusconnectbackend.common.location.config;

import com.campusconnect.campusconnectbackend.common.location.entity.City;
import com.campusconnect.campusconnectbackend.common.location.entity.Country;
import com.campusconnect.campusconnectbackend.common.location.entity.State;
import com.campusconnect.campusconnectbackend.common.location.repository.CityRepository;
import com.campusconnect.campusconnectbackend.common.location.repository.CountryRepository;
import com.campusconnect.campusconnectbackend.common.location.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LocationSeeder implements CommandLineRunner {

    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    @Override
    public void run(String... args) throws Exception {
        if (countryRepository.count() == 0) {
            seedIndia();
            seedUSA();
            seedUK();
            seedCanada();
            seedAustralia();
        }
    }

    private void seedIndia() {
        Country india = countryRepository.save(new Country("India"));
        
        State gujarat = stateRepository.save(new State("Gujarat", india));
        saveCities(gujarat, "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Nadiad", "Gandhinagar");

        State maharashtra = stateRepository.save(new State("Maharashtra", india));
        saveCities(maharashtra, "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad");

        State karnataka = stateRepository.save(new State("Karnataka", india));
        saveCities(karnataka, "Bengaluru", "Mysuru", "Mangaluru", "Belagavi");
    }

    private void seedUSA() {
        Country usa = countryRepository.save(new Country("USA"));
        
        State california = stateRepository.save(new State("California", usa));
        saveCities(california, "Los Angeles", "San Francisco", "San Diego", "San Jose");

        State newYork = stateRepository.save(new State("New York", usa));
        saveCities(newYork, "New York City", "Buffalo", "Rochester");
    }

    private void seedUK() {
        Country uk = countryRepository.save(new Country("UK"));
        
        State england = stateRepository.save(new State("England", uk));
        saveCities(england, "London", "Birmingham", "Manchester", "Liverpool");
    }

    private void seedCanada() {
        Country canada = countryRepository.save(new Country("Canada"));
        
        State ontario = stateRepository.save(new State("Ontario", canada));
        saveCities(ontario, "Toronto", "Ottawa", "Mississauga");
    }

    private void seedAustralia() {
        Country australia = countryRepository.save(new Country("Australia"));
        
        State nsw = stateRepository.save(new State("New South Wales", australia));
        saveCities(nsw, "Sydney", "Newcastle", "Wollongong");
    }

    private void saveCities(State state, String... cityNames) {
        for (String cityName : cityNames) {
            cityRepository.save(new City(cityName, state));
        }
    }
}
