package com.campusconnect.campusconnectbackend.security.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;

import org.springframework.data.redis.connection.RedisConnectionFactory;

import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RedisConfig implements CachingConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {

        RedisSerializer<Object> jsonSerializer = RedisSerializer.json();

        RedisCacheConfiguration baseConfig =
                RedisCacheConfiguration.defaultCacheConfig()
                        .disableCachingNullValues()
                        .computePrefixWith(cacheName -> "campusconnect::" + cacheName + "::")
                        .serializeKeysWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(new StringRedisSerializer())
                        )
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(jsonSerializer)
                        );

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        cacheConfigs.put("college_name", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("college_adminName", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("college_dashboard_stats", baseConfig.entryTtl(Duration.ofDays(3)));
        cacheConfigs.put("college_subscription", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("college_subscription_history", baseConfig.entryTtl(Duration.ofDays(7)));

        cacheConfigs.put("journalists", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("journalist_dashboard_stats", baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("journalist_details", baseConfig.entryTtl(Duration.ofDays(3)));
        cacheConfigs.put("journalist_requests", baseConfig.entryTtl(Duration.ofDays(1)));
        cacheConfigs.put("journalist_request", baseConfig.entryTtl(Duration.ofDays(1)));
        cacheConfigs.put("journalist_topNewsPapers",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("journalist_draftPapers",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("journalist_newsPapers",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("top_newsPapers",  baseConfig.entryTtl(Duration.ofHours(8)));
        cacheConfigs.put("latest_news",  baseConfig.entryTtl(Duration.ofHours(8)));
        cacheConfigs.put("college_newsPapers",  baseConfig.entryTtl(Duration.ofHours(8)));

        cacheConfigs.put("reviewer_stats", baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("reviewer_details", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("reviewer_name", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("reviewers", baseConfig.entryTtl(Duration.ofDays(3)));

        cacheConfigs.put("myResearch", baseConfig.entryTtl(Duration.ofDays(3)));
        cacheConfigs.put("research_papers",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("not_reviewed_researches",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("under_review_researches",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("reviewed_researches",  baseConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigs.put("pending_researches",  baseConfig.entryTtl(Duration.ofDays(12)));

        cacheConfigs.put("joined_clubs", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("clubs", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("club_details",  baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("club_members",  baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("club_profile", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("club_dashboard_stats", baseConfig.entryTtl(Duration.ofDays(1)));

        cacheConfigs.put("club_requests", baseConfig.entryTtl(Duration.ofDays(1)));
        cacheConfigs.put("club_teams", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("club_team_names", baseConfig.entryTtl(Duration.ofDays(7)));

        cacheConfigs.put("announcements", baseConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigs.put("notifications", baseConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("latest_announcements", baseConfig.entryTtl(Duration.ofMinutes(30)));

        cacheConfigs.put("active_events", baseConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("finished_events", baseConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("topActive_events", baseConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("topActive_clubEvents", baseConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("active_clubEvents", baseConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigs.put("finished_clubEvents", baseConfig.entryTtl(Duration.ofHours(1)));

        cacheConfigs.put("students", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("student_name", baseConfig.entryTtl(Duration.ofDays(7)));
        cacheConfigs.put("student_dashboard_stats", baseConfig.entryTtl(Duration.ofHours(1)));



        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(baseConfig.entryTtl(Duration.ofMinutes(20)))
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }

    @Override
    public CacheErrorHandler errorHandler() {

        return new CacheErrorHandler() {

            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                logger.error("Redis GET error for key {} : {}", key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                logger.error("Redis PUT error for key {} : {}", key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                logger.error("Redis EVICT error for key {} : {}", key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                logger.error("Redis CLEAR error : {}", exception.getMessage());
            }
        };
    }
}