package com.makerspace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // Explicit getters to ensure compilation works
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
}

