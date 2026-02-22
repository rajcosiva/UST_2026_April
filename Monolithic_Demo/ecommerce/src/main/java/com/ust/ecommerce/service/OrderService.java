package com.ust.ecommerce.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.ust.ecommerce.model.Order;
import com.ust.ecommerce.repository.OrderRepository;
import com.ust.ecommerce.repository.UserRepository;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    // CREATE
    public Order createOrder(Order order) {

        validateUser(order.getUserId());

        return orderRepository.save(order);
    }

    // READ ALL
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // READ BY ID
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + id));
    }

    // UPDATE
    public Order updateOrder(Long id, Order updatedOrder) {

        Order existingOrder = getOrderById(id);

        validateUser(updatedOrder.getUserId());

        existingOrder.setProduct(updatedOrder.getProduct());
        existingOrder.setPrice(updatedOrder.getPrice());
        existingOrder.setUserId(updatedOrder.getUserId());

        return orderRepository.save(existingOrder);
    }

    // DELETE
    public void deleteOrder(Long id) {

        Order existingOrder = getOrderById(id);

        orderRepository.delete(existingOrder);
    }

    // PRIVATE VALIDATION METHOD
    private void validateUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + userId));
    }
}