import { connectMade } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request) {
  try {
    await connectMade();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");

    const query = categorySlug ? { category: categorySlug } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });

    return new NextResponse(JSON.stringify({ success: true, products }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}