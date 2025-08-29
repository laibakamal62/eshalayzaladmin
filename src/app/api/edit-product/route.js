// app/api/edit-product/route.js
import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// ✅ Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic"; // ensure server execution

export async function POST(req) {
  await connectMade();

  try {
    // ✅ Get product ID from query
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // ✅ Collect base fields
    const updateData = {
      name: formData.get("name"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      description: formData.get("description"),
    };

    // ✅ Handle main product image
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
      updateData.image = uploadRes.secure_url;
    }

    // ✅ Parse variation objects
    const variationsData = [];
    for (const key of formData.keys()) {
      if (key.startsWith("variations[")) {
        variationsData.push({ key, value: formData.get(key) });
      }
    }

    // Sort variations to maintain correct order
    variationsData.sort((a, b) => {
      const aIndex = parseInt(a.key.match(/variations\[(\d+)\]/)[1], 10);
      const bIndex = parseInt(b.key.match(/variations\[(\d+)\]/)[1], 10);
      return aIndex - bIndex;
    });

    const variations = [];
    for (const item of variationsData) {
      const index = parseInt(item.key.match(/variations\[(\d+)\]/)[1], 10);
      const variationObj = JSON.parse(item.value);

      // Look for corresponding image file
      const variationImageKey = `variationImage_${index}`;
      const variationImageFile = formData.get(variationImageKey);

      if (variationImageFile && variationImageFile.size > 0) {
        const buffer = Buffer.from(await variationImageFile.arrayBuffer());
        const uploadRes = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream({ folder: "products/variations" }, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            })
            .end(buffer);
        });
        variationObj.image = uploadRes.secure_url;
      }

      // if no new file uploaded, keep old image (don't overwrite with empty string)
      variations.push(variationObj);
    }

    updateData.variations = variations;

    // ✅ Update product in DB
    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Edit product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
