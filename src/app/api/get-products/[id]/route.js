import { NextResponse } from "next/server";
import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req, { params }) {
  try {
    await connectMade();
    const product = await Product.findById(params.id);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Product not found" }),
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    console.log("Fetched product:", product); // Debug: Log fetched product

    return new NextResponse(
      JSON.stringify({ success: true, product }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}