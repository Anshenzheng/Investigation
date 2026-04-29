package com.wenji.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDto {
    private Long id;
    private String text;
    private String type;
    private Boolean required;
    private Integer order;
    private List<QuestionOptionDto> options;
}
