import { NextResponse } from 'next/server';
import { connectMade } from '@/lib/mongodb';
import Category from '@/models/Category';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const image = formData.get('image');

    if (!name || !image) {
      return NextResponse.json({ success: false, message: 'Missing fields' });
    }

    await connectMade();

    // Convert file to Base64 Data URI
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = image.type; // e.g., image/png or image/jpeg
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'categories',
    });

    // Save category in DB
    const newCategory = await Category.create({
      name,
      image: uploadResult.secure_url, // Cloudinary URL
    });

    return NextResponse.json({
      success: true,
      message: 'Category added successfully',
      data: newCategory,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      message: 'Error adding category',
      error: err.message,
    });
  }
}
