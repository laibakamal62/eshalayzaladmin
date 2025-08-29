import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectMade } from '@/lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req) {
  try {
    await connectMade();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Category ID required' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' });
    }

    // Optional: delete image from Cloudinary
    if (category.image) {
      const publicId = category.image.split('/').pop().split('.')[0]; // extract filename without extension
      try {
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete image from Cloudinary:', err.message);
      }
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error deleting category', error: error.message });
  }
}
