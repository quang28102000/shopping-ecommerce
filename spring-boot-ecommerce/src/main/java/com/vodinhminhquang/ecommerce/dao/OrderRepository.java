package com.vodinhminhquang.ecommerce.dao;

import com.vodinhminhquang.ecommerce.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface OrderRepository extends JpaRepository<Order, Long> {

    // SELECT * FROM orders LEFT OUTER JOIN customer
    // ON orders.customer_id = customer.id
    // WHERE customer.email = :email
    // ORDER BY order.date_created DESC
    Page<Order> findByCustomerEmailOrderByDateCreatedDesc(@Param("email") String email, Pageable pageable);
    
}
