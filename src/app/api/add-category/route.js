import { NextResponse } from "next/server";
import { connectMade } from "@/lib/mongodb";
import Category from "@/models/Category";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const image = formData.get("image");

    if (!name || !image) {
      console.log("Missing fields:", { name, image });
      return NextResponse.json({ success: false, message: "Missing fields" });
    }

    // Connect to MongoDB
    await connectMade();

    // Upload image to Cloudinary
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: "categories", resource_type: "image", public_id: `${Date.now()}-${image.name.split('.')[0]}` },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return NextResponse.json({ success: false, message: "Image upload failed", error });
        }

        // Save category in DB
        const newCategory = await Category.create({
          name,
          image: result.secure_url, // ✅ Save Cloudinary URL
        });

        return NextResponse.json({
          success: true,
          message: "Category added successfully",
          data: newCategory,
        });
      }
    );

    // Convert buffer to stream for Cloudinary
    const streamifier = require("streamifier");
    streamifier.createReadStream(buffer).pipe(uploadResult);

  } catch (err) {
    console.error("Full error stack:", err);
    return NextResponse.json({
      success: false,
      message: "Error adding category",
      error: err.message,
    });
  }
}
