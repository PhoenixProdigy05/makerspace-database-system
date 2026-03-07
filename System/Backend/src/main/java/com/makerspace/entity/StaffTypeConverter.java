package com.makerspace.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StaffTypeConverter implements AttributeConverter<User.StaffType, String> {
    
    @Override
    public String convertToDatabaseColumn(User.StaffType attribute) {
        if (attribute == null) {
            return null;
        }
        switch (attribute) {
            case Technician:
                return "Technician";
            case Manager:
                return "Manager";
            case Intern:
                return "Intern";
            case Admin:
                return "Admin";
            default:
                throw new IllegalArgumentException("Unknown StaffType: " + attribute);
        }
    }
    
    @Override
    public User.StaffType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        switch (dbData) {
            case "Technician":
                return User.StaffType.Technician;
            case "Manager":
                return User.StaffType.Manager;
            case "Intern":
                return User.StaffType.Intern;
            case "Admin":
                return User.StaffType.Admin;
            default:
                throw new IllegalArgumentException("Unknown StaffType value: " + dbData);
        }
    }
}

