package com.wenji.survey.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OptionCreateRequest {
    private Long id;
    
    @NotBlank(message = "选项内容不能为空")
    private String text;
    
    private Integer order;
}
