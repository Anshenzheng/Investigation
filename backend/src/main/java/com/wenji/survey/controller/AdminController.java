package com.wenji.survey.controller;

import com.wenji.survey.dto.*;
import com.wenji.survey.security.JwtService;
import com.wenji.survey.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SurveyService surveyService;
    private final StatisticsService statisticsService;
    private final ExportService exportService;
    private final JwtService jwtService;

    @GetMapping("/surveys")
    public ResponseEntity<List<SurveySummaryDto>> getAllSurveys() {
        List<SurveySummaryDto> surveys = surveyService.getAllSurveys();
        return ResponseEntity.ok(surveys);
    }

    @PostMapping("/surveys")
    public ResponseEntity<SurveyDto> createSurvey(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SurveyCreateRequest request) {
        Long userId = extractUserId(authHeader);
        SurveyDto survey = surveyService.createSurvey(request, userId);
        return ResponseEntity.ok(survey);
    }

    @PutMapping("/surveys/{id}")
    public ResponseEntity<SurveyDto> updateSurvey(
            @PathVariable Long id,
            @Valid @RequestBody SurveyCreateRequest request) {
        SurveyDto survey = surveyService.updateSurvey(id, request);
        return ResponseEntity.ok(survey);
    }

    @DeleteMapping("/surveys/{id}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Long id) {
        surveyService.deleteSurvey(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/surveys/{id}/publish")
    public ResponseEntity<SurveyDto> publishSurvey(@PathVariable Long id) {
        SurveyDto survey = surveyService.publishSurvey(id);
        return ResponseEntity.ok(survey);
    }

    @PutMapping("/surveys/{id}/close")
    public ResponseEntity<SurveyDto> closeSurvey(@PathVariable Long id) {
        SurveyDto survey = surveyService.closeSurvey(id);
        return ResponseEntity.ok(survey);
    }

    @GetMapping("/surveys/{id}/results")
    public ResponseEntity<SurveyStatisticsDto> getSurveyResults(@PathVariable Long id) {
        SurveyStatisticsDto statistics = statisticsService.getSurveyStatistics(id);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/surveys/{id}/export")
    public ResponseEntity<byte[]> exportSurveyResults(
            @PathVariable Long id,
            @RequestParam(defaultValue = "csv") String format) {
        
        byte[] data;
        String filename;
        MediaType mediaType;

        if ("excel".equalsIgnoreCase(format)) {
            data = exportService.exportToExcel(id);
            filename = "survey_results_" + id + ".xml";
            mediaType = MediaType.parseMediaType("application/vnd.ms-excel");
        } else {
            data = exportService.exportToCsv(id);
            filename = "survey_results_" + id + ".csv";
            mediaType = MediaType.parseMediaType("text/csv; charset=UTF-8");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(data);
    }

    @PostMapping("/surveys/{id}/copy")
    public ResponseEntity<SurveyDto> copySurvey(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        Long userId = extractUserId(authHeader);
        String newTitle = request.getOrDefault("newTitle", "复制的问卷");
        SurveyDto survey = surveyService.copySurvey(id, newTitle, userId);
        return ResponseEntity.ok(survey);
    }

    @PostMapping("/surveys/templates/{templateId}/create")
    public ResponseEntity<SurveyDto> createFromTemplate(
            @PathVariable Long templateId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        Long userId = extractUserId(authHeader);
        String newTitle = request.getOrDefault("newTitle", "基于模板创建的问卷");
        SurveyDto survey = surveyService.copySurvey(templateId, newTitle, userId);
        return ResponseEntity.ok(survey);
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}
