'use client';

export const dynamic = "force-dynamic";

import { useState } from "react";

const PRODUCTS = [
  {
    id: "house",
    name: "House Blend 250g",
    price: 9.5,
    description: "Smooth, balanced espresso blend.",
    image: "/house-blend.jpg", // put your own image in /public folder
  },
  {
    id: "single",
    name: "Single Origin 250g",
    price: 11,
    description: "Bright, fruity filter roast.",
    image: "/single-origin.jpg",
  },
  {
    id: "decaf",
    name: "Decaf 250g",
    price: 10.5,
    description: "Full flavour, no caffeine.",
    image: "/decaf.jpg",
  },
];

export default function Page() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    company: "",
    address: "",
  });

  function addToCart(product) {
    setCart([...cart, product]);
  }

  function removeFromCart(index) {
    setCart(cart.filter((_, i) => i !== index));
  }

  function placeOrder() {
    alert(
      `✅ Order placed!\n\n` +
      `Customer: ${customer.name}\n` +
      `Email: ${customer.email}\n` +
      `Company: ${customer.company}\n` +
      `Address: ${customer.address}\n\n` +
      `Items:\n${cart.map(p => "- " + p.name).join("\n")}`
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>4REO</h1>

      <h2>Products</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center"
          }}>
            <img
              src={p.image}
              alt={p.name}
              style={{ maxWidth: "100%", height: "150px", objectFit: "cover" }}
            />
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p><strong>£{p.price.toFixed(2)}</strong></p>
            <button onClick={() => addToCart(p)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "40px" }}>Cart</h2>
      {cart.length === 0 ? <p>Cart is empty</p> : (
        <ul>
          {cart.map((p, i) => (
            <li key={i}>
              {p.name}{" "}
              <button onClick={() => removeFromCart(i)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Your Details</h2>
      <input
        placeholder="Name"
        value={customer.name}
        onChange={e => setCustomer({ ...customer, name: e.target.value })}
        style={{ display: "block", marginBottom: 8 }}
      />
      <input
        placeholder="Email"
        value={customer.email}
        onChange={e => setCustomer({ ...customer, email: e.target.value })}
        style={{ display: "block", marginBottom: 8 }}
      />
      <input
        placeholder="Company Name"
        value={customer.company}
        onChange={e => setCustomer({ ...customer, company: e.target.value })}
        style={{ display: "block", marginBottom: 8 }}
      />
      <textarea
        placeholder="Delivery Address"
        value={customer.address}
        onChange={e => setCustomer({ ...customer, address: e.target.value })}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
