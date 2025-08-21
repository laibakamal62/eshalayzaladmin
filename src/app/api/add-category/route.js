import { writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { connectMade } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const image = formData.get('image');

    if (!name || !image) {
      console.log("Missing fields:", { name, image });
      return NextResponse.json({ success: false, message: 'Missing fields' });
    }

    // 1. Connect to MongoDB
    await connectMade();

    // 2. Prepare image buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageName = `${Date.now()}-${image.name}`;

    // 3. Ensure public/uploads folder exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const imagePath = path.join(uploadDir, imageName);

    // 4. Save image to public/uploads
    console.log("Saving image to:", imagePath);
    await writeFile(imagePath, buffer);

    // 5. Save category in DB
    const newCategory = await Category.create({
      name,
      image: `uploads/${imageName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Category added successfully',
      data: newCategory,
    });
  } catch (err) {
    console.error('Full error stack:', err);
    return NextResponse.json({
      success: false,
      message: 'Error adding category',
      error: err.message,
    });
  }
}
