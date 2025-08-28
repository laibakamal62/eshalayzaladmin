// app/api/edit-product/route.js
import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic"; // make sure it runs on server

export async function POST(req) {
  await connectMade();

  try {
    // Extract ID from query string (e.g. /api/edit-product?id=123)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const formData = await req.formData();

    const updateData = {
      name: formData.get("name"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      description: formData.get("description"),
    };

    // Handle main image
    const imageFile = formData.get("image");
    if (imageFile && imageFile.name) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join(process.cwd(), "public/uploads/products", fileName);
      await writeFile(filePath, buffer);
      updateData.image = fileName;
    }

    // Handle variations
    const variations = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("variations[")) {
        variations.push(JSON.parse(value));
      }
    }

    // Add variation images
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("variationImage_") && value && value.name) {
        const index = key.split("_")[1];
        const buffer = Buffer.from(await value.arrayBuffer());
        const fileName = `${Date.now()}-${value.name}`;
        const filePath = path.join(process.cwd(), "public/uploads/products", fileName);
        await writeFile(filePath, buffer);

        if (variations[index]) {
          variations[index].image = fileName;
        }
      }
    }

    updateData.variations = variations;

    // Update in DB
    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Edit product error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
