package com.wenji.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SurveyStatisticsDto {
    private Long totalResponses;
    private List<QuestionStatisticsDto> questionStats;
}
