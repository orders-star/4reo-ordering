// app/api/create-order/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
    const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      console.error("Missing Shopify environment variables");
      return NextResponse.json(
        { error: "Missing Shopify environment variables" },
        { status: 500 }
      );
    }

    if (!body.cart || body.cart.length === 0) {
      console.error("No items provided in order body:", body);
      return NextResponse.json(
        { error: "No items provided in order body" },
        { status: 400 }
      );
    }

    const line_items = body.cart.map((item) => ({
      title: `${item.name} — ${item.size}`,
      quantity:
