package com.wenji.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SurveyDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Boolean isAnonymous;
    private LocalDateTime deadline;
    private Boolean isTemplate;
    private Long responseCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private String createdByName;
    private List<QuestionDto> questions;
}
