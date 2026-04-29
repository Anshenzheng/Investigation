package com.wenji.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionStatisticsDto {
    private Long questionId;
    private String questionText;
    private String questionType;
    private Map<Long, Long> optionCounts;
    private List<String> textAnswers;
    private Map<Integer, Long> ratingDistribution;
    private Double ratingAverage;
}
