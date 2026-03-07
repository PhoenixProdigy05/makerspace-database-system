package com.makerspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private String userId;
    private String id;
    private String _id;
    
    // Explicit setters to ensure compilation works
    public void setToken(String token) {
        this.token = token;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public void set_id(String _id) {
        this._id = _id;
    }
}

