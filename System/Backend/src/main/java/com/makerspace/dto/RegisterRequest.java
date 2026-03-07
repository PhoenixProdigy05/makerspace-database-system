package com.makerspace.dto;

import com.makerspace.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String phoneNumber;
    
    // Role is optional for public registration - backend will force Member role
    private User.Role role;
    
    private User.StaffType staffType;
    
    // Explicit getters to ensure compilation works
    public String getFullName() {
        return fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public User.Role getRole() {
        return role;
    }
    
    public User.StaffType getStaffType() {
        return staffType;
    }
}

