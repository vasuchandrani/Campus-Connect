package com.campusconnect.campusconnectbackend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Long userId, String role, Long collegeId) {
        return Jwts.builder()
                .claim("userId", userId)
                .claim("role", role)
                .claim("collegeId", collegeId)
                .subject(String.valueOf(userId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            // JJWT 0.12.x API: use .parser().verifyWith() instead of deprecated parserBuilder().setSigningKey()
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        } else if (userIdObj instanceof String) {
            return Long.parseLong((String) userIdObj);
        }
        String subject = claims.getSubject();
        if (subject != null && !subject.isEmpty()) {
            return Long.parseLong(subject);
        }
        throw new JwtException("User ID is missing from token");
    }

    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public Long getCollegeId(String token) {
        Object collegeIdObj = getClaims(token).get("collegeId");
        if (collegeIdObj instanceof Number) {
            return ((Number) collegeIdObj).longValue();
        } else if (collegeIdObj instanceof String) {
            return Long.parseLong((String) collegeIdObj);
        }
        return null;
    }
}
