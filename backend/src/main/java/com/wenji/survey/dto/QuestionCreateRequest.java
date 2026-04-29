package com.wenji.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuestionCreateRequest {
    private Long id;
    
    @NotBlank(message = "题目内容不能为空")
    private String text;
    
    @NotBlank(message = "题目类型不能为空")
    private String type;
    
    @NotNull(message = "必填选项不能为空")
    private Boolean required;
    
    private Integer order;
    
    @Valid
    private List<OptionCreateRequest> options;
}
