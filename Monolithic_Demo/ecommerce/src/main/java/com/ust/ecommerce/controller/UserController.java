package com.ust.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.ust.ecommerce.model.User;
import com.ust.ecommerce.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }
}