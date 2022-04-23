package com.vodinhminhquang.ecommerce.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.vodinhminhquang.ecommerce.dao.CustomerRepository;
import com.vodinhminhquang.ecommerce.dto.PaymentInfo;
import com.vodinhminhquang.ecommerce.dto.Purchase;
import com.vodinhminhquang.ecommerce.dto.PurchaseResponse;
import com.vodinhminhquang.ecommerce.entity.Customer;
import com.vodinhminhquang.ecommerce.entity.Order;
import com.vodinhminhquang.ecommerce.entity.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private CustomerRepository customerRepository;

    @Autowired
    public CheckoutServiceImpl(CustomerRepository customerRepository,
                               @Value("${stripe.key.secret}") String secretKey) {
        this.customerRepository = customerRepository;

        // initialize Stripe API with secret key
        Stripe.apiKey = secretKey;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {

        // retrieve the order info from dto
        Order order = purchase.getOrder();

        // generate tracking number
        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        // populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(order::add);

        // populate order with billingAddress and shippingAddress
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        // populate customer with order
        Customer customer = purchase.getCustomer();

        // whether the customer is existing or not
        String theEmail = customer.getEmail();

        Customer customerFromDB = customerRepository.findByEmail(theEmail);

        // returns null if the object doesn't exist
        if (customerFromDB != null) {
            // assign the customer from the DB to the current one instead of adding a new one
            customer = customerFromDB;
        }

        // add the order to the customer
        customer.add(order);

        // save to the database
        customerRepository.save(customer);

        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {

        List<String> paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");

        Map<String, Object> params = new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types", paymentMethodTypes);
        params.put("description", "E-commerce Web Application");
        params.put("receipt_email", paymentInfo.getReceiptEmail());

        return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNumber() {
        // generate a random UUID (Universally unique identifier) number (UUID version-4)
        return UUID.randomUUID().toString();
    }
}
