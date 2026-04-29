package com.wenji.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SurveySummaryDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Boolean isAnonymous;
    private LocalDateTime deadline;
    private Boolean isTemplate;
    private Long responseCount;
    private LocalDateTime createdAt;
    private String createdBy;
}
