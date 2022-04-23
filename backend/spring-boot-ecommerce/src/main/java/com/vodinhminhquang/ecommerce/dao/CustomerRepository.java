package com.vodinhminhquang.ecommerce.dao;

import com.vodinhminhquang.ecommerce.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ~ SELECT * FROM Customer c WHERE c.email = theEmail
    Customer findByEmail(String theEmail);

}
