// app/api/delete-product/route.js
import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ success: false, message: "Missing ID" }, { status: 400 });
  }

  try {
    await connectMade();
    await Product.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("[DELETE ERROR]:", err);
    return Response.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}
