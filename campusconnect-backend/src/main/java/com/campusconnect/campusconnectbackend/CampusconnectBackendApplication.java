package com.campusconnect.campusconnectbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CampusconnectBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusconnectBackendApplication.class, args);
    }

}
