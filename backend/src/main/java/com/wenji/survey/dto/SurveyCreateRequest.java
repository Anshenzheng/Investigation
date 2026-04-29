package com.wenji.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SurveyCreateRequest {
    @NotBlank(message = "问卷标题不能为空")
    @Size(max = 200, message = "标题长度不能超过200个字符")
    private String title;
    
    @Size(max = 2000, message = "描述长度不能超过2000个字符")
    private String description;
    
    @NotNull(message = "匿名选项不能为空")
    private Boolean isAnonymous;
    
    private LocalDateTime deadline;
    
    private Boolean isTemplate = false;
    
    @Valid
    @Size(min = 1, message = "至少需要一个题目")
    private List<QuestionCreateRequest> questions;
}
