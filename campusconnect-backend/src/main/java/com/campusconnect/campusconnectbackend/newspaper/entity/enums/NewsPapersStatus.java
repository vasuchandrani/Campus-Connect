package com.campusconnect.campusconnectbackend.newspaper.entity.enums;

public enum NewsPapersStatus {
    DRAFT,
    CREATED,                // await for college admin approval
    APPROVED,               // approved and published within college
    REJECTED,               // rejected by college admin
    DELETED,                // removed by college admin after publication
    GLOBALIZATION_REQUESTED,// journalist requested publication across colleges
    UNDER_VOTING,           // all college admin voting for publish global
    GLOBALLY_PUBLISHED      // published globally
}
