package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberActivityDto {
    private LocalDate date;
    private int activeMembers;
    private int newMembers;
    private int suspendedMembers;
    private int totalBookings;
    
    // Explicit setters to ensure compilation works
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public void setActiveMembers(int activeMembers) {
        this.activeMembers = activeMembers;
    }
    
    public void setNewMembers(int newMembers) {
        this.newMembers = newMembers;
    }
    
    public void setSuspendedMembers(int suspendedMembers) {
        this.suspendedMembers = suspendedMembers;
    }
    
    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }
}
