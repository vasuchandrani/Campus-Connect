package com.campusconnect.campusconnectbackend.security.config;

import com.campusconnect.campusconnectbackend.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, RateLimitFilter rateLimitFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // allow CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // public routes
                        .requestMatchers(
                                "/campus-connect/college-admin/signup",
                                "/campus-connect/college-admin/login",
                                "/campus-connect/college-admin/create-order",
                                "/campus-connect/college-admin/verify",

                                "/campus-connect/student/signup",
                                "/campus-connect/student/login",

                                "/campus-connect/journalist/login",
                                "/campus-connect/professor/login",
                                "/campus-connect/professor/signup",

                                "/campus-connect/colleges",
                                "/campus-connect/colleges/*/departments",

                                "/campus-connect/email/**",

                                "/campus-connect/security/reset-pwd",
                                "/campus-connect/security/send-code",
                                "/campus-connect/security/verify-code"
                        ).permitAll()

                        // Department management for College Admin
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/campus-connect/departments/**", "/campus-connect/admin/departments/**").hasRole("COLLEGE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/campus-connect/departments/**", "/campus-connect/admin/departments/**").hasRole("COLLEGE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/campus-connect/departments/**", "/campus-connect/admin/departments/**").hasRole("COLLEGE_ADMIN")

                        // Role-based routes
                        .requestMatchers("/campus-connect/college-admin/**")
                        .hasRole("COLLEGE_ADMIN")

                        .requestMatchers("/campus-connect/student/**")
                        .hasRole("STUDENT")

                        .requestMatchers("/campus-connect/journalist/**")
                        .hasRole("JOURNALIST")

                        .requestMatchers(
                                "/campus-connect/professor/clubs/*/mentor-dashboard",
                                "/campus-connect/professor/clubs/*/mentor-dashboard/**",
                                "/campus-connect/professor/clubs/*/sub-login/mentor",
                                "/campus-connect/professor/clubs/*/mentor/return-to-professor",
                                "/campus-connect/professor/return-to-professor"
                        ).hasAnyRole("CLUB_MENTOR", "PROFESSOR")

                        .requestMatchers("/campus-connect/professor/**")
                        .hasRole("PROFESSOR")

                        // club routes are used by students, club staff, professors, and college admins
                        .requestMatchers("/campus-connect/clubs/**")
                        .hasAnyRole("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER", "PROFESSOR", "COLLEGE_ADMIN", "CLUB_MENTOR")

                        // event registration & payment routes
                        .requestMatchers("/campus-connect/events/**")
                        .hasAnyRole("STUDENT", "CLUB_ADMIN", "CLUB_MEMBER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        rateLimitFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}