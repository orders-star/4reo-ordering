'use client';

export const dynamic = "force-dynamic";

import { useState } from "react";

const PRODUCTS = [
  {
    id: "milky",
    name: "Milky Way Blend",
    description: "Smooth and creamy, perfect with milk.",
    image: "/milky-way.jpg", // add your own image in /public
  },
  {
    id: "wakey",
    name: "Wakey Wakey Blend",
    description: "Bold, strong and guaranteed to wake you up.",
    image: "/wakey-wakey.jpg",
  },
  {
    id: "easy",
    name: "Easy Peasy Blend",
    description: "Light, easy-drinking and super smooth.",
    image: "/easy-peasy.jpg",
  },
];

const SIZES = [
  { label: "1kg Bag", price: 20 },
  { label: "8kg Bucket", price: 140 },
];

export default function Page() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    company: "",
    address: "",
  });

  function addToCart(product, size) {
    setCart([...cart, { ...product, size: size.label, price: size.price }]);
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
      `Items:\n${cart.map(p => `- ${p.name} (${p.size}) £${p.price}`).join("\n")}`
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#fdfbf5", minHeight: "100vh", margin: 0 }}>
      {/* Header */}
      <header style={{ background: "#001f3f", color: "white", padding: "16px", textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>4REO</h1>
      </header>

      <main style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Product Grid */}
        <h2 style={{ color: "#001f3f" }}>Products</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px"
        }}>
          {PRODUCTS.map(p => (
            <div key={p.id} style={{
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              padding: "16px",
              textAlign: "center"
            }}>
              <img
                src={p.image}
                alt={p.name}
                style={{ maxWidth: "100%", height: "160px", objectFit: "cover", borderRadius: "6px" }}
              />
              <h3 style={{ margin: "12px 0 6px", color: "#001f3f" }}>{p.name}</h3>
              <p style={{ color: "#333", fontSize: "0.9em" }}>{p.description}</p>

              <select id={`size-${p.id}`} style={{ marginBottom: "10px", padding: "6px" }}>
                {SIZES.map((s, i) => (
                  <option key={i} value={i}>
                    {s.label} — £{s.price}
                  </option>
                ))}
              </select>
              <br />
              <button
                onClick={() => {
                  const select = document.getElementById(`size-${p.id}`);
                  const chosen = SIZES[select.value];
                  addToCart(p, chosen);
                }}
                style={{
                  background: "#001f3f",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <h2 style={{ marginTop: "40px", color: "#001f3f" }}>Cart</h2>
        {cart.length === 0 ? <p>Cart is empty</p> : (
          <ul style={{ paddingLeft: "20px" }}>
            {cart.map((p, i) => (
              <li key={i} style={{ marginBottom: "6px" }}>
                {p.name} ({p.size}) — £{p.price}
                <button
                  onClick={() => removeFromCart(i)}
                  style={{
                    marginLeft: "8px",
                    background: "transparent",
                    border: "1px solid #001f3f",
                    color: "#001f3f",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Customer Details */}
        <h2 style={{ marginTop: "40px", color: "#001f3f" }}>Your Details</h2>
        <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
          <input
            placeholder="Name"
            value={customer.name}
            onChange={e => setCustomer({ ...customer, name: e.target.value })}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            placeholder="Email"
            value={customer.email}
            onChange={e => setCustomer({ ...customer, email: e.target.value })}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            placeholder="Company Name"
            value={customer.company}
            onChange={e => setCustomer({ ...customer, company: e.target.value })}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <textarea
            placeholder="Delivery Address"
            value={customer.address}
            onChange={e => setCustomer({ ...customer, address: e.target.value })}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px" }}
          />
        </div>

        <button
          onClick={placeOrder}
          style={{
            marginTop: "20px",
            background: "#001f3f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "1em",
            cursor: "pointer"
          }}
        >
          Place Order
        </button>
      </main>
    </div>
  );
}
