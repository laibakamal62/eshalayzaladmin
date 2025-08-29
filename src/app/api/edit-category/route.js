import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { connectMade } from "@/lib/mongodb";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req) {
  try {
    await connectMade();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Category ID required" });
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const image = formData.get("image"); // File if new image uploaded

    const updateData = {
      name,
      slug: slugify(name, { lower: true, strict: true }),
    };

    if (image && typeof image !== "string") {
      const buffer = Buffer.from(await image.arrayBuffer());

      // Upload new image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "categories", public_id: `${Date.now()}-${image.name.split(".")[0]}` },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

      updateData.image = uploadResult.secure_url; // ✅ Save Cloudinary URL
    }

    await Category.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error updating category", error: error.message });
  }
}
