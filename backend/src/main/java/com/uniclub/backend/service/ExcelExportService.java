package com.uniclub.backend.service;

import com.uniclub.backend.entity.AttendanceSubmission;
import com.uniclub.backend.entity.Event;
import com.uniclub.backend.entity.Registration;
import com.uniclub.backend.entity.User;
import com.uniclub.backend.repository.AttendanceSubmissionRepository;
import com.uniclub.backend.repository.EventRepository;
import com.uniclub.backend.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final RegistrationRepository registrationRepository;
    private final AttendanceSubmissionRepository submissionRepository;
    private final EventRepository eventRepository;

    public byte[] generateAttendanceExcel(Long eventId, String branch, String year, String division, String searchRoll) throws IOException {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        List<AttendanceSubmission> submissions = submissionRepository.findAll().stream()
                .filter(s -> s.getSession().getEvent().getId().equals(eventId))
                .toList();

        Map<Integer, AttendanceSubmission> submissionMap = submissions.stream()
                .collect(Collectors.toMap(
                        s -> s.getStudent().getId(), 
                        s -> s, 
                        (existing, replacement) -> existing // Keep the first submission if duplicates exist
                ));

        java.util.Set<String> feedbackQuestions = new java.util.LinkedHashSet<>();
        for (AttendanceSubmission sub : submissions) {
            if (sub.getResponses() != null) {
                feedbackQuestions.addAll(sub.getResponses().keySet());
            }
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance Report");

            // Club Name Row (Row 0)
            Row clubRow = sheet.createRow(0);
            Cell clubCell = clubRow.createCell(0);
            String clubName = event.getClub() != null ? event.getClub().getName() : "Unknown Club";
            clubCell.setCellValue("Club: " + clubName);
            CellStyle clubStyle = workbook.createCellStyle();
            Font clubFont = workbook.createFont();
            clubFont.setBold(true);
            clubFont.setFontHeightInPoints((short) 12);
            clubFont.setColor(IndexedColors.GREY_80_PERCENT.getIndex());
            clubStyle.setFont(clubFont);
            clubCell.setCellStyle(clubStyle);

            // Title Row (Row 1)
            Row titleRow = sheet.createRow(1);
            Cell titleCell = titleRow.createCell(0);
            String titleStr = "Event Attendance Report - " + (event.getTitle() != null ? event.getTitle() : "Event");
            if (event.getStartTime() != null) {
                titleStr += " (" + event.getStartTime().toLocalDate() + ")";
            }
            titleCell.setCellValue(titleStr);
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            // Header Row (Row 3)
            Row headerRow = sheet.createRow(3);
            java.util.List<String> headersList = new java.util.ArrayList<>(java.util.Arrays.asList(
                "Name", "Email", "Moodle ID", "Branch", "Year", "Division", "Roll Number", "Attendance Status", "Feedback Timestamp"
            ));
            headersList.addAll(feedbackQuestions);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            for (int i = 0; i < headersList.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headersList.get(i));
                cell.setCellStyle(headerStyle);
            }

            // Styles
            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle attendedStyle = workbook.createCellStyle();
            attendedStyle.setAlignment(HorizontalAlignment.CENTER);
            Font attendedFont = workbook.createFont();
            attendedFont.setColor(IndexedColors.GREEN.getIndex());
            attendedFont.setBold(true);
            attendedStyle.setFont(attendedFont);

            CellStyle absentStyle = workbook.createCellStyle();
            absentStyle.setAlignment(HorizontalAlignment.CENTER);
            Font absentFont = workbook.createFont();
            absentFont.setColor(IndexedColors.RED.getIndex());
            absentFont.setBold(true);
            absentStyle.setFont(absentFont);

            int rowIdx = 4;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Registration reg : registrations) {
                User student = reg.getStudent();
                if (student == null) continue;
                AttendanceSubmission submission = submissionMap.get(student.getId());

                // Apply Filters
                if (branch != null && !branch.isEmpty() && (student.getDepartment() == null || !student.getDepartment().equalsIgnoreCase(branch))) {
                    continue;
                }
                if (year != null && !year.isEmpty() && (student.getYear() == null || !student.getYear().equalsIgnoreCase(year))) {
                    continue;
                }
                String recDiv = submission != null ? submission.getDivision() : null;
                if (division != null && !division.isEmpty() && (recDiv == null || !recDiv.equalsIgnoreCase(division))) {
                    continue;
                }
                String recRoll = submission != null ? submission.getRollNo() : null;
                if (searchRoll != null && !searchRoll.isEmpty() && (recRoll == null || !recRoll.toLowerCase().contains(searchRoll.toLowerCase()))) {
                    continue;
                }

                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(student.getFullName());
                row.createCell(1).setCellValue(student.getEmail());
                row.createCell(2).setCellValue(student.getMoodleId() != null ? student.getMoodleId() : "-");
                
                Cell branchCell = row.createCell(3);
                branchCell.setCellValue(student.getDepartment() != null ? student.getDepartment() : "-");
                branchCell.setCellStyle(centerStyle);

                Cell yearCell = row.createCell(4);
                yearCell.setCellValue(student.getYear() != null ? student.getYear() : "-");
                yearCell.setCellStyle(centerStyle);

                Cell divCell = row.createCell(5);
                divCell.setCellValue(recDiv != null ? recDiv : "-");
                divCell.setCellStyle(centerStyle);

                Cell rollCell = row.createCell(6);
                rollCell.setCellValue(recRoll != null ? recRoll : "-");
                rollCell.setCellStyle(centerStyle);

                Cell statusCell = row.createCell(7);
                if (reg.isPresent()) {
                    statusCell.setCellValue("ATTENDED");
                    statusCell.setCellStyle(attendedStyle);
                    
                    if (submission != null && submission.getSubmittedAt() != null) {
                        row.createCell(8).setCellValue(submission.getSubmittedAt().format(formatter));
                    } else {
                        row.createCell(8).setCellValue("-");
                    }
                } else {
                    statusCell.setCellValue("ABSENT");
                    statusCell.setCellStyle(absentStyle);
                    row.createCell(8).setCellValue("-");
                }

                int colIdx = 9;
                for (String question : feedbackQuestions) {
                    Cell feedbackCell = row.createCell(colIdx++);
                    if (submission != null && submission.getResponses() != null && submission.getResponses().containsKey(question)) {
                        feedbackCell.setCellValue(submission.getResponses().get(question));
                    } else {
                        feedbackCell.setCellValue("-");
                    }
                }
            }

            for (int i = 0; i < headersList.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
