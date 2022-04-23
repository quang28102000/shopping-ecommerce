package com.vodinhminhquang.ecommerce.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.vodinhminhquang.ecommerce.dto.PaymentInfo;
import com.vodinhminhquang.ecommerce.dto.Purchase;
import com.vodinhminhquang.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;

}
