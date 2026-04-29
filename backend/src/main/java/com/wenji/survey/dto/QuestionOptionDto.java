package com.wenji.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionOptionDto {
    private Long id;
    private String text;
    private Integer order;
}
