package com.ust.ecommerce.service;



import org.springframework.stereotype.Service;
import java.util.List;
import com.ust.ecommerce.model.Order;
import com.ust.ecommerce.repository.OrderRepository;
import com.ust.ecommerce.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public Order createOrder(Order order) {

        // Validate user exists
        userRepository.findById(order.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}