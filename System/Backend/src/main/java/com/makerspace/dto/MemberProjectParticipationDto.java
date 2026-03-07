package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberProjectParticipationDto {
    private String projectId;
    private String projectName;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status; // PLANNING, IN_PROGRESS, COMPLETED, CANCELLED
    private String role; // LEAD, CONTRIBUTOR, OBSERVER
    private int hoursSpent;
    private String skills;
    private String outcome;
    
    // Explicit getters to ensure compilation works
    public String getProjectId() {
        return projectId;
    }
    
    public String getProjectName() {
        return projectName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public String getRole() {
        return role;
    }
    
    public int getHoursSpent() {
        return hoursSpent;
    }
    
    public String getSkills() {
        return skills;
    }
    
    public String getOutcome() {
        return outcome;
    }
    
    // Explicit setters to ensure compilation works
    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
    
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public void setHoursSpent(int hoursSpent) {
        this.hoursSpent = hoursSpent;
    }
    
    public void setSkills(String skills) {
        this.skills = skills;
    }
    
    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }
}
