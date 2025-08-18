export async function POST(req) {
  try {
    const body = await req.json();

    const { cart, name, email, company, address } = body;

    if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing Shopify environment variables" }),
        { status: 500 }
      );
    }

    // 🔑 Map product + size → Shopify Variant IDs
    const VARIANT_MAP = {
      "Milky Way Blend": {
        "1kg Bag": "56109627736438",
        "8kg Bucket": "56109627769206",
      },
      "Wakey Wakey Blend": {
        "1kg Bag": "56109631504758",
        "8kg Bucket": "56109631537526",
      },
      "Easy Peasy Blend": {
        "1kg Bag": "56109634191734",
        "8kg Bucket": "56109634224502",
      },
    };

    // 🔄 Convert cart items into Shopify line_items
    const line_items = cart.map((item) => {
      const variantId = VARIANT_MAP[item.name]?.[item.size];
      if (!variantId) {
        throw new Error(`Variant ID not found for ${item.name} - ${item.size}`);
      }

      return {
        variant_id: variantId,
        quantity: item.quantity || 1,
      };
    });

    // 🛒 Draft order payload
    const draftOrder = {
      draft_order: {
        line_items,
        customer: {
          first_name: name,
          email: email,
        },
        shipping_address: {
          address1: address,
          company: company,
          first_name: name,
        },
      },
    };

    // 📡 Send to Shopify Admin API
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        },
        body: JSON.stringify(draftOrder),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return new Response(JSON.stringify({ error: data }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    console.error("ERROR in create-order:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
