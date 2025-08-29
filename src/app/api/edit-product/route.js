import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// ✅ Configure Cloudinary (uses .env variables)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic"; // ensure server execution

export async function POST(req) {
  await connectMade();

  try {
    // Get product ID from query
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

    // ✅ Main product image
    const imageFile = formData.get("image");
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream({ folder: "products" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
      updateData.image = uploadRes.secure_url; // ✅ Cloudinary URL
    }

    // ✅ Variations
    const variations = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("variations[")) {
        variations.push(JSON.parse(value));
      }
    }

    // ✅ Variation images
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("variationImage_") && value && value.size > 0) {
        const index = key.split("_")[1];
        const buffer = Buffer.from(await value.arrayBuffer());
        const uploadRes = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream({ folder: "products/variations" }, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            })
            .end(buffer);
        });
        if (variations[index]) {
          variations[index].image = uploadRes.secure_url; // ✅ Cloudinary URL
        }
      }
    }

    updateData.variations = variations;

    // ✅ Update product in DB
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
