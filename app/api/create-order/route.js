// app/api/create-order/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, address, postcode, cart } = body;

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;        // e.g. deluxe-coffeeworks-london.myshopify.com
    const SHOPIFY_TOKEN  = process.env.SHOPIFY_ADMIN_API_TOKEN;     // Admin API access token

    // Basic safety checks
    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      console.error("Missing Shopify env vars:", {
        SHOPIFY_STORE_DOMAIN_present: !!SHOPIFY_DOMAIN,
        SHOPIFY_ADMIN_API_TOKEN_present: !!SHOPIFY_TOKEN,
      });
      return new Response(
        JSON.stringify({ success: false, error: "Server misconfigured: missing Shopify env variables." }),
        { status: 500 }
      );
    }
    if (!cart || cart.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Cart is empty." }), { status: 400 });
    }

    // Map product + size -> Shopify variant_id (your IDs)
    const VARIANT_MAP = {
      "Milky Way Blend": {
        "1kg Bag":   "56109627736438",
        "8kg Bucket":"56109627769206",
      },
      "Wakey Wakey Blend": {
        "1kg Bag":   "56109631504758",
        "8kg Bucket":"56109631537526",
      },
      "Easy Peasy Blend": {
        "1kg Bag":   "56109634191734",
        "8kg Bucket":"56109634224502",
      },
    };

    const line_items = cart.map((item) => {
      const variantId = VARIANT_MAP[item.name]?.[item.size];
      if (!variantId) {
        throw new Error(`No variant_id mapping for "${item.name}" — "${item.size}"`);
      }
      return {
        variant_id: Number(variantId),
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      };
    });

    const orderPayload = {
      order: {
        line_items,
        customer: {
          first_name: name || "Guest",
          email: email || undefined,
        },
        shipping_address: {
          first_name: name || "Guest",
