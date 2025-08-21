import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { connectMade } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const brand = formData.get("brand"); // ✅ Get brand
    const image = formData.get("image");
    const description = formData.get("description");
    const variations = [];

    console.log("Received formData:", {
      name,
      price,
      stock,
      category,
      brand,
      description,
      image: image ? image.name : null,
    });

    if (!name || !price || !stock || !category || !image) {
      return NextResponse.json({ success: false, message: "Missing required fields" });
    }

    await connectMade();

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const mainImageBuffer = Buffer.from(await image.arrayBuffer());
    const mainImageName = `${Date.now()}-${image.name.replace(/\s+/g, "_").toLowerCase()}`;
    const mainImagePath = path.join(uploadDir, mainImageName);
    await writeFile(mainImagePath, mainImageBuffer);

    const variationsData = [];
    for (const key of formData.keys()) {
      if (key.startsWith("variations[")) {
        variationsData.push({ key, value: formData.get(key) });
      }
    }

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
        const imageName = `${Date.now()}-var-${i}-${variationImageFile.name.replace(/\s+/g, "_").toLowerCase()}`;
        const imagePath = path.join(uploadDir, imageName);
        await writeFile(imagePath, buffer);
        variationObj.image = imageName;
      } else {
        variationObj.image = "";
      }

      variations.push(variationObj);
    }

    const newProduct = await Product.create({
      name,
      price,
      stock,
      category,
      brand, // ✅ Save brand
      image: mainImageName,
      description,
      variations,
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
