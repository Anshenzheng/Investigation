package com.wenji.survey.dto;

import jakarta.validation.Valid;
import lombok.Data;
import java.util.List;

@Data
public class SurveySubmitRequest {
    @Valid
    private List<AnswerSubmitRequest> answers;
}
