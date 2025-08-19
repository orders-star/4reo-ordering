"use client";

import React, { useState, useEffect } from "react";

export default function Page() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    company: "",
    address: "",
    postcode: "",
  });
  const [confirmation, setConfirmation] = useState(null); // for order summary

  const products = [
    { name: "Milky Way Blend", sizes: ["1kg Bag", "8kg Bucket"], prices: { "1kg Bag": 20, "8kg Bucket": 140 } },
    { name: "Wakey Wakey Blend", sizes: ["1kg Bag", "8kg Bucket"], prices: { "1kg Bag": 18, "8kg Bucket": 125 } },
    { name: "Easy Peasy Blend", sizes: ["1kg Bag", "8kg Bucket"], prices: { "1kg Bag": 17, "8kg Bucket": 120 } },
  ];

  // 🛒 Add to cart
  const addToCart = (productName, size, price) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === productName && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item.name === productName && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { name: productName, size, price, quantity: 1 }];
    });
  };

  const increaseQty = (productName, size) => {
    setCart((prev) =>
      prev.map((item) =>
        item.name === productName && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (productName, size) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.name === productName && item.size === size
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productName, size) => {
    setCart((prev) => prev.filter((item) => !(item.name === productName && item.size === size)));
  };

  // 💷 Running total + delivery
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = customer.postcode && !customer.postcode.startsWith("E") && !customer.postcode.startsWith("W") && !customer.postcode.startsWith("N") && !customer.postcode.startsWith("SE") 
    ? 6 
    : 0; // crude "inside M25" check
  const total = subtotal + deliveryFee;

  // 🚀 Submit order
  const placeOrder = async () => {
    if (!customer.company || !customer.address) {
      alert("⚠️ Please fill in company name and address before placing order.");
      return;
    }

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, cart }),
      });
      const data = await response.json();
      if (data.success) {
        // save customer details to localStorage
        localStorage.setItem("customerDetails", JSON.stringify(customer));

        setConfirmation({ cart, customer, total });
        setCart([]);
      } else {
        console.error("Order error:", data);
        alert("⚠️ Something went wrong. Check console for details.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error. Please try again.");
    }
  };

  // Load saved customer details
  useEffect(() => {
    const saved = localStorage.getItem("customerDetails");
    if (saved) setCustomer(JSON.parse(saved));

    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lora:wght@400;500&family=Playfair+Display:wght@600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  if (confirmation) {
    return (
      <div
        style={{
          fontFamily: "'Lora', serif",
          background: "#fdfcf7",
          color: "#001f3f",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", marginBottom: "1rem" }}>
          ✅ Thank you for your order!
        </h1>
        <p>We’ve received your order and will process it shortly.</p>

        <h2 style={{ marginTop: "2rem" }}>Order Summary</h2>
        {confirmation.cart.map((item) => (
          <p key={`${item.name}-${item.size}`}>
            {item.quantity} × {item.name} ({item.size}) — £{item.price * item.quantity}
          </p>
        ))}
        <p>Delivery: £{deliveryFee}</p>
        <h3>Total: £{confirmation.total}</h3>

        <h2 style={{ marginTop: "2rem" }}>Delivery Details</h2>
        <p>
          {confirmation.customer.company}, {confirmation.customer.address}, {confirmation.customer.postcode}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Lora', serif",
        background: "#fdfcf7",
        color: "#001f3f",
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: "700" }}>
          4REO Ordering
        </h1>
      </header>

      {/* Products grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {products.map((p) => (
          <div
            key={p.name}
            style={{
              border: "2px solid #001f3f",
              borderRadius: "10px",
              padding: "1.5rem",
              background: "#fff",
              transition: "transform 0.2s ease",
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              {p.name}
            </h2>
            {p.sizes.map((size) => (
              <button
                key={size}
                onClick={() => addToCart(p.name, size, p.prices[size])}
                style={{
                  display: "block",
                  marginBottom: "0.75rem",
                  padding: "0.6rem 1rem",
                  background: "#001f3f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "500",
                  transition: "background 0.2s ease",
                }}
              >
                Add {size} (£{p.prices[size]})
              </button>
            ))}
          </div>
        ))}
      </section>

      {/* Bottom Section: Cart + Customer side by side */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginTop: "auto",
        }}
      >
        {/* Cart */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: "1rem" }}>
            🛒 Your Cart
          </h2>
          {cart.length === 0 && <p>Cart is empty</p>}
          {cart.map((item) => (
            <div
              key={`${item.name}-${item.size}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                padding: "0.5rem 0",
              }}
            >
              <div>
                {item.name} — {item.size}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => decreaseQty(item.name, item.size)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.5rem",
                    marginRight: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  ➖
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item.name, item.size)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.5rem",
                    marginLeft: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  ➕
                </button>
              </div>
              <div style={{ marginLeft: "1rem" }}>£{item.price * item.quantity}</div>
              <button
                onClick={() => removeFromCart(item.name, item.size)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginLeft: "0.5rem",
                }}
              >
                ❌
              </button>
            </div>
          ))}
          {cart.length > 0 && (
            <>
              <h3 style={{ marginTop: "1rem", fontSize: "1.1rem" }}>Subtotal: £{subtotal}</h3>
              <h3 style={{ fontSize: "1.1rem" }}>Delivery: £{deliveryFee}</h3>
              <h2 style={{ marginTop: "0.5rem", fontSize: "1.3rem", fontWeight: "700" }}>Total: £{total}</h2>
            </>
          )}
        </div>

        {/* Customer Details */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: "1rem" }}>
            📦 Your Details
          </h2>
          {["name", "email", "company", "address", "postcode"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={customer[field]}
              onChange={(e) => setCustomer({ ...customer, [field]: e.target.value })}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "1rem",
                padding: "0.9rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />
          ))}

          <button
            onClick={placeOrder}
            style={{
              marginTop: "1rem",
              padding: "1rem 2rem",
              background: "#001f3f",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              width: "100%",
              fontWeight: "600",
            }}
          >
            🚀 Place Order
          </button>
        </div>
      </section>
    </div>
  );
}
