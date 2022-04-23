package com.vodinhminhquang.ecommerce.dto;

import com.vodinhminhquang.ecommerce.entity.Address;
import com.vodinhminhquang.ecommerce.entity.Customer;
import com.vodinhminhquang.ecommerce.entity.Order;
import com.vodinhminhquang.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

}
