package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.entity.CollegeSubscription;
import com.campusconnect.campusconnectbackend.college.repository.CollegeSubscriptionRepository;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdmin;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ChangePasswordRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.CollegeAdminProfileDto;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.req.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.jwt.JwtTokenProvider;
import com.campusconnect.campusconnectbackend.security.security_management.dto.req.ForgetPasswordRequestDto;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class CollegeAdminAuth {
    private final AuthenticationManager authenticationManager;
    private final CollegeAdminRepository collegeAdminRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final CollegeRepository collegeRepository;
    private final CollegeSubscriptionRepository collegeSubscriptionRepository;

    // college-admin signup
    @Transactional
    public AuthResponseDto store(CollegeAdminSignupRequestDto request) {
        var plan = request.getSubscription();
        if (plan == null) {
            return new AuthResponseDto(
                    null,
                    "Your subscription not found",
                    "/campus-connect/auth"
            );
        }

        // create college
        College college = new College();
        college.setName(request.getCollegeName());
        college.setDomain(request.getDomain());
        college.setAddress(request.getAddress());
        college.setWebsite(request.getWebsite());
        college.setAbout(request.getAboutCollege());
        college.setIsActive(false);
        college.setVerified(false);

        // save college in db
        College savedCollege = collegeRepository.save(college);

        // create college-subscription
        CollegeSubscription subscription = new CollegeSubscription();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusMonths(plan.getDurationInMonths());

        subscription.setPlanName(plan.getPlanName());
        subscription.setAmount(plan.getAmount());
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);
        subscription.setCollege(savedCollege);
        // save subscription in db
        collegeSubscriptionRepository.save(subscription);

        // create college-admin
        CollegeAdmin admin = new CollegeAdmin();
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setPhoneNumber(request.getPhoneNumber());

        admin.setCollege(savedCollege);
        // save college-admin in db
        CollegeAdmin savedAdmin = collegeAdminRepository.save(admin);

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                savedAdmin.getId(),
                "COLLEGE_ADMIN",
                savedAdmin.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "COLLEGE_ADMIN",
                "/campus-connect/college-admin/dashboard"
        );
    }

    // college-admin login
    public AuthResponseDto authenticate(LoginRequestDto request) {

        String compositeUsername = "COLLEGE_ADMIN:" + request.getEmail();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        compositeUsername,
                        request.getPassword()
                )
        );

        CollegeAdmin collegeAdmin = collegeAdminRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // generate jwt-token
        String token = jwtTokenProvider.generateToken(
                collegeAdmin.getId(),
                "COLLEGE_ADMIN",
                collegeAdmin.getCollege().getId()
        );

        return new AuthResponseDto(
                token,
                "COLLEGE_ADMIN",
                "/campus-connect/college-admin/dashboard"
        );
    }

    // reset password
    @Transactional
    public MessageResponseDto resetPassword(ForgetPasswordRequestDto request) {
        try {
            String email = request.getEmail();
            String password = request.getPassword();

            // find student
            CollegeAdmin admin = collegeAdminRepository.findByEmail(email).orElseThrow(
                    () -> new RuntimeException("User not found, Try again!")
            );

            // change password
            admin.setPasswordHash(passwordEncoder.encode(password));
            collegeAdminRepository.save(admin);

            return new MessageResponseDto("Your password changed successfully!");
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // get college-admin profile
    public CollegeAdminProfileDto getProfile(Long collegeAdminId) {

        // find college-admin
        CollegeAdmin admin = collegeAdminRepository.findById(collegeAdminId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );
        // find college
        College college = admin.getCollege();

        // create response
        CollegeAdminProfileDto profile = new CollegeAdminProfileDto();
        profile.setFullName(admin.getFullName());
        profile.setEmail(admin.getEmail());
        profile.setPhoneNumber(admin.getPhoneNumber());
        profile.setCollegeName(college.getName());
        profile.setDomain(college.getDomain());
        profile.setWebsite(college.getWebsite());
        profile.setCollegeAddress(college.getAddress());
        profile.setCollegeDescription(college.getAbout());

        return profile;
    }

    // update profile
    @Transactional
    public MessageResponseDto updateProfile(Long collegeAdminId, CollegeAdminProfileDto request) {

        // find college-admin
        CollegeAdmin admin = collegeAdminRepository.findById(collegeAdminId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );
        // find college
        College college = admin.getCollege();

        // overwrite all fields to update

        // college fields
        college.setName(request.getCollegeName());
        college.setDomain(request.getDomain());
        college.setWebsite(request.getWebsite());
        college.setAddress(request.getCollegeAddress());
        college.setAbout(request.getCollegeDescription());

        College savedCollege = collegeRepository.save(college);

        // admin fields
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setCollege(savedCollege);

        collegeAdminRepository.save(admin);

        return new MessageResponseDto("Your profile has been updated successfully!");
    }

    // change password when provided old-password
    @Transactional
    public MessageResponseDto changePassword(Long currentUserId, ChangePasswordRequestDto request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        // find college-admin
        CollegeAdmin admin = collegeAdminRepository.findById(currentUserId).orElseThrow(
                () -> new RuntimeException("You are not logged in")
        );

        // check old-password
        if (!passwordEncoder.matches(oldPassword, admin.getPasswordHash())) {
            return new MessageResponseDto("Your old-password is wrong!");
        }

        // update
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        collegeAdminRepository.save(admin);

        return new MessageResponseDto("Your password changed successfully!");
    }
}
