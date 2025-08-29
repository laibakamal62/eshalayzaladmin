import { NextResponse } from "next/server";
import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary"; // we'll create this helper

export async function POST(req) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const brand = formData.get("brand");
    const image = formData.get("image");
    const description = formData.get("description");
    const variations = [];

    if (!name || !price || !stock || !category || !image) {
      return NextResponse.json({ success: false, message: "Missing required fields" });
    }

    await connectMade();

    // ✅ Upload main image to Cloudinary
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    const mainImageUrl = uploadResult.secure_url;

    // ✅ Handle variations
    const variationsData = [];
    for (const key of formData.keys()) {
      if (key.startsWith("variations[")) {
        variationsData.push({ key, value: formData.get(key) });
      }
    }

    // Sort variations by index
    variationsData.sort((a, b) => {
      const aIndex = parseInt(a.key.match(/variations\[(\d+)\]/)[1], 10);
      const bIndex = parseInt(b.key.match(/variations\[(\d+)\]/)[1], 10);
      return aIndex - bIndex;
    });

    for (let i = 0; i < variationsData.length; i++) {
      const variationObj = JSON.parse(variationsData[i].value);

      const variationImageKey = `variationImage_${i}`;
      const variationImageFile = formData.get(variationImageKey);

      if (variationImageFile && variationImageFile.size > 0) {
        const buffer = Buffer.from(await variationImageFile.arrayBuffer());

        const varUpload = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products/variations" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });

        variationObj.image = varUpload.secure_url;
      } else {
        variationObj.image = "";
      }

      variations.push(variationObj);
    }

    // ✅ Save to MongoDB
    const newProduct = await Product.create({
      name,
      price,
      stock,
      category,
      brand,
      image: mainImageUrl,
      description,
      variations,
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
