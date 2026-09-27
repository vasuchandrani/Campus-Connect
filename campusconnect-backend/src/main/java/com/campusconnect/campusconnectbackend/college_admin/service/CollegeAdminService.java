package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college_admin.dto.res.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;

public interface CollegeAdminService {

    String getCollegeName(Long collegeId);

    String getName(Long collegeAdminId);

    CollegeAdmin getAdmin(College college);

    CollegeAdminDashboardStatsDto getStats(Long collegeId);
}
