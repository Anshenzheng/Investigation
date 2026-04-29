package com.wenji.survey.dto;

import lombok.Data;
import java.util.List;

@Data
public class AnswerSubmitRequest {
    private Long questionId;
    private String questionType;
    private String textValue;
    private Long optionId;
    private List<Long> optionIds;
    private Integer ratingValue;
}
