package com.ust.ecommerce.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.ust.ecommerce.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}