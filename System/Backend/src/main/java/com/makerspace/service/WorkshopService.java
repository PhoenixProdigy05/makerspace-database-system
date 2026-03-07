package com.makerspace.service;

import com.makerspace.dto.WorkshopDtos;
import com.makerspace.entity.User;
import com.makerspace.entity.Workshop;
import com.makerspace.entity.WorkshopRegistration;
import com.makerspace.repository.UserRepository;
import com.makerspace.repository.WorkshopRegistrationRepository;
import com.makerspace.repository.WorkshopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkshopService {

    @Autowired
    private WorkshopRepository workshopRepository;

    @Autowired
    private WorkshopRegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    private WorkshopDtos.WorkshopResponse toResponse(Workshop w) {
        WorkshopDtos.WorkshopResponse response = new WorkshopDtos.WorkshopResponse();
        response.setWorkshopId(w.getWorkshopId());
        response.setTitle(w.getTitle());
        response.setInstructor(w.getInstructor());
        response.setDate(w.getDate());
        response.setCapacity(w.getCapacity());
        response.setStatus(w.getStatus().name());
        response.setCreatedAt(w.getCreatedAt());
        response.setUpdatedAt(w.getUpdatedAt());
        return response;
    }

    public List<WorkshopDtos.WorkshopResponse> list() {
        return workshopRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WorkshopDtos.WorkshopResponse get(UUID id) {
        Workshop w = workshopRepository.findById(id).orElseThrow(() -> new RuntimeException("Workshop not found"));
        return toResponse(w);
    }

    public WorkshopDtos.WorkshopResponse create(WorkshopDtos.CreateWorkshopRequest req) {
        Workshop workshop = new Workshop();
        workshop.setTitle(req.getTitle());
        workshop.setInstructor(req.getInstructor());
        workshop.setCapacity(req.getCapacity());
        workshop.setStatus(Workshop.Status.SCHEDULED);
        if (req.getDate() != null && !req.getDate().isBlank()) {
            workshop.setDate(LocalDateTime.parse(req.getDate(), DateTimeFormatter.ISO_DATE_TIME));
        }
        return toResponse(workshopRepository.save(workshop));
    }

    public WorkshopDtos.WorkshopResponse update(UUID id, WorkshopDtos.UpdateWorkshopRequest req) {
        Workshop w = workshopRepository.findById(id).orElseThrow(() -> new RuntimeException("Workshop not found"));
        if (req.getTitle() != null) w.setTitle(req.getTitle());
        if (req.getInstructor() != null) w.setInstructor(req.getInstructor());
        if (req.getCapacity() != null) w.setCapacity(req.getCapacity());
        if (req.getDate() != null && !req.getDate().isBlank()) {
            w.setDate(LocalDateTime.parse(req.getDate(), DateTimeFormatter.ISO_DATE_TIME));
        }
        if (req.getStatus() != null) {
            w.setStatus(Workshop.Status.valueOf(req.getStatus()));
        }
        return toResponse(workshopRepository.save(w));
    }

    public void delete(UUID id) {
        workshopRepository.deleteById(id);
    }

    public WorkshopDtos.WorkshopResponse cancel(UUID id) {
        Workshop w = workshopRepository.findById(id).orElseThrow(() -> new RuntimeException("Workshop not found"));
        w.setStatus(Workshop.Status.CANCELLED);
        return toResponse(workshopRepository.save(w));
    }

    public WorkshopDtos.WorkshopResponse complete(UUID id) {
        Workshop w = workshopRepository.findById(id).orElseThrow(() -> new RuntimeException("Workshop not found"));
        w.setStatus(Workshop.Status.COMPLETED);
        return toResponse(workshopRepository.save(w));
    }

    public List<WorkshopDtos.RegistrationResponse> registrations(UUID workshopId) {
        return registrationRepository.findByWorkshop_WorkshopId(workshopId).stream()
                .map(r -> {
                    WorkshopDtos.RegistrationResponse response = new WorkshopDtos.RegistrationResponse();
                    response.setWorkshopId(r.getWorkshop().getWorkshopId());
                    response.setMemberId(r.getUser().getUserId());
                    response.setRegisteredAt(r.getRegisteredAt());
                    return response;
                })
                .collect(Collectors.toList());
    }

    public void addRegistration(UUID workshopId, UUID memberId) {
        Workshop w = workshopRepository.findById(workshopId).orElseThrow(() -> new RuntimeException("Workshop not found"));
        User u = userRepository.findById(memberId).orElseThrow(() -> new RuntimeException("User not found"));
        registrationRepository.findByWorkshopAndUser(w, u).ifPresent(existing -> { throw new RuntimeException("Already registered"); });
        WorkshopRegistration registration = new WorkshopRegistration();
        registration.setWorkshop(w);
        registration.setUser(u);
        registrationRepository.save(registration);
    }

    public void removeRegistration(UUID workshopId, UUID memberId) {
        Workshop w = workshopRepository.findById(workshopId).orElseThrow(() -> new RuntimeException("Workshop not found"));
        User u = userRepository.findById(memberId).orElseThrow(() -> new RuntimeException("User not found"));
        registrationRepository.findByWorkshopAndUser(w, u).ifPresent(registrationRepository::delete);
    }

    public String exportRegistrationsCsv(UUID workshopId) {
        List<WorkshopDtos.RegistrationResponse> rows = registrations(workshopId);
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        pw.println("workshopId,memberId,registeredAt");
        for (WorkshopDtos.RegistrationResponse r : rows) {
            pw.printf("%s,%s,%s%n", r.getWorkshopId(), r.getMemberId(), r.getRegisteredAt());
        }
        pw.flush();
        return sw.toString();
    }
}
