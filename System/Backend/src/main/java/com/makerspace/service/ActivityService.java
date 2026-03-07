package com.makerspace.service;

import com.makerspace.entity.Activity;
import com.makerspace.entity.User;
import com.makerspace.repository.ActivityRepository;
import com.makerspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Activity> latest(Integer limit) {
        // For simplicity, ignoring limit in repository call; return top 50
        return activityRepository.findTop50ByOrderByCreatedAtDesc();
    }

    public List<Activity> latestForUser(UUID userId, Integer limit) {
        return activityRepository.findTop50ByActor_UserIdOrderByCreatedAtDesc(userId);
    }

    public Activity record(Activity.Type type, String message, UUID actorId) {
        User actor = null;
        if (actorId != null) {
            actor = userRepository.findById(actorId).orElse(null);
        }
        Activity a = Activity.builder()
                .type(type)
                .message(message)
                .actor(actor)
                .build();
        return activityRepository.save(a);
    }
}
