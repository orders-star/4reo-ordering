'use client';

import { useState } from "react";

const PRODUCTS = [
  { id: "house", name: "House Blend 250g", price: 9.5 },
  { id: "single", name: "Single Origin 250g", price: 11 },
  { id: "decaf", name: "Decaf 250g", price: 10.5 },
  { id: "mug", name: "Diner Mug", price: 12 },
];

export default function Page() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    fulfilment: "Pickup", // or "Delivery"
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
      `Order placed!\n\nCustomer: ${customer.name}\nEmail: ${customer.email}\nFulfilment: ${customer.fulfilment}\nAddress: ${customer.address}\n\nItems:\n${cart.map(p => "- " + p.name).join("\n")}`
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Deluxe Coffeeworks Orders</h1>

      <h2>Products</h2>
      {PRODUCTS.map(p => (
        <div key={p.id} style={{ marginBottom: 8 }}>
          {p.name} — £{p.price.toFixed(2)}{" "}
          <button onClick={() => addToCart(p)}>Add</button>
        </div>
      ))}

      <h2>Cart</h2>
      {cart.length === 0 && <p>Cart is empty</p>}
      <ul>
        {cart.map((p, i) => (
          <li key={i}>
            {p.name}{" "}
            <button onClick={() => removeFromCart(i)}>Remove</button>
          </li>
        ))}
      </ul>

      <h2>Your Details</h2>
      <input
        placeholder="Name"
        value={customer.name}
        onChange={e => setCustomer({ ...customer, name: e.target.value })}
      />
      <br />
      <input
        placeholder="Email"
        value={customer.email}
        onChange={e => setCustomer({ ...customer, email: e.target.value })}
      />
      <br />
      <select
        value={customer.fulfilment}
        onChange={e => setCustomer({ ...customer, fulfilment: e.target.value })}
      >
        <option>Pickup</option>
        <option>Delivery</option>
      </select>
      <br />
      {customer.fulfilment === "Delivery" && (
        <input
          placeholder="Address"
          value={customer.address}
          onChange={e => setCustomer({ ...customer, address: e.target.value })}
        />
      )}

      <br />
      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
