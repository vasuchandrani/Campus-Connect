package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentRepoService {

    private final StudentRepository studentRepository;
    private final StudentAuth studentAuth;
    private final EmailDispatcherService emailDispatcherService;
    private final AuthService authService;

    // get DTO
    private StudentResponseDto getDto(Student student) {
        // create dto
        StudentResponseDto dto = new StudentResponseDto();
        if (student == null) return dto;

        // map the data
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setFullName(student.getFullName());
        dto.setEmail(student.getEmail());
        dto.setGender(student.getGender());
        dto.setDepartment(student.getDepartment());
        dto.setYear(student.getYear());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setVerified(student.isVerified());
        dto.setCollegeId(student.getCollege().getId());

        return dto;
    }

    // get DTO -list
    private List<StudentResponseDto> getDtoList(List<Student> students) {
        // create response
        List<StudentResponseDto> response = new ArrayList<>();

        for (Student student : students) {
            response.add(getDto(student));
        }
        return response;
    }

    @Caching(evict = {
            @CacheEvict(value = "myResearches", key = "'student_' + #studentId"),
    })
    public void evictStudentResearchCaches(Long studentId) {}


    // get student by id (for backend-use)
    public Student getStudent(Long studentId) {
        return studentRepository.findStudentById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // get student by email (for backend-use)
    public Student getStudentByEmail (String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
    }

    // get count of student of college
    public int getStudentCountByCollege (Long collegeId) {
        return studentRepository.countByCollege_Id(collegeId);
    }

    // get all students of college
    @Cacheable(value = "students", key = "'college_' + #collegeId", sync = true)
    public List<StudentResponseDto> getAllStudents(Long collegeId) {

        List<Student> students = studentRepository.findAllByCollege_Id(collegeId);
        return getDtoList(students);
    }

    /* College-Admin */

    // generate password
    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    @Async
    protected void sendEmailsAsync(List<StudentSignupRequestDto> students) {

        for (StudentSignupRequestDto student : students) {
            try {
                emailDispatcherService.sendStudentRegistrationMail(
                        student.getEmail(),
                        student.getPassword()
                );
            } catch (Exception e) {
                System.err.println("Failed to send email to: " + student.getEmail());
            }
        }
    }

    // register multiple students
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "students", key = "'college_' + #collegeId"),
    })
    public MessageResponseDto processExcel(MultipartFile file, Long collegeId) {

        List<StudentSignupRequestDto> students = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                String email    = row.getCell(0).getStringCellValue().trim();
                String name     = row.getCell(1).getStringCellValue().trim();
                String id       = row.getCell(2).getStringCellValue().trim();
                String gender   = row.getCell(3).getStringCellValue().trim();
                String dept     = row.getCell(4).getStringCellValue().trim();
                int year        = (int) row.getCell(5).getNumericCellValue();
                String password = generatePassword();

                StudentSignupRequestDto dto = new StudentSignupRequestDto();
                dto.setId(id);
                dto.setEmail(email);
                dto.setFullName(name);
                dto.setGender(gender);
                dto.setDepartment(dept);
                dto.setYear(year);
                dto.setPassword(password);
                dto.setCollegeId(collegeId);

                if (!studentRepository.existsByStudentId(id)) {
                    // create student if not exist
                    studentAuth.createStudentAccount(dto);
                    students.add(dto);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process Excel: " + e.getMessage());
        }
        sendEmailsAsync(students);

        return new MessageResponseDto("Students registered successfully!");
    }

    // register single student
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "students", key = "'college_' + #collegeId"),
    })
    public MessageResponseDto registerStudent(StudentRegisterRequestDto request, Long collegeId) {

        // generate password
        String password = generatePassword();

        StudentSignupRequestDto dto = new StudentSignupRequestDto();
        dto.setId(request.getId());
        dto.setEmail(request.getEmail());
        dto.setFullName(request.getFullName());
        dto.setPassword(password);
        dto.setGender(request.getGender());
        dto.setDepartment(request.getDepartment());
        dto.setYear(request.getYear());
        dto.setCollegeId(collegeId);

        if (studentRepository.existsByStudentId(request.getId())) {
            return new MessageResponseDto("Student already exists!");
        }
        boolean isSaved = studentAuth.createStudentAccount(dto);
        // send mail
        boolean mailSent = emailDispatcherService.sendStudentRegistrationMail(request.getEmail(), password);

        if (!isSaved || !mailSent) {
            return new MessageResponseDto("Student registration failed for " + request.getFullName());
        }
        return new MessageResponseDto("Student registered successfully!");
    }

    // delete student
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "students", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", key = "@authService.getCurrentCollegeId()")
    })
    public MessageResponseDto removeStudent(Long studentId) {
        try {
            if (!studentRepository.existsById(studentId)) {
                return new MessageResponseDto("Student not found!");
            }
            // delete
            studentRepository.deleteById(studentId);

            return new MessageResponseDto("Student with id " + studentId + " deleted successfully!");
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return new MessageResponseDto("Failed to remove studentId: " + studentId);
        }
    }
}
