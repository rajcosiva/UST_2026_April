package com.ust.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ust.ecommerce.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}