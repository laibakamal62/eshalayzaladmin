import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectMade } from '@/lib/mongodb';
import slugify from 'slugify';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req) {
  try {
    await connectMade();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Category ID required' });
    }

    const formData = await req.formData();
    const name = formData.get('name');
    const image = formData.get('image'); // File if new image uploaded

    const updateData = {
      name,
      slug: slugify(name, { lower: true, strict: true }),
    };

    if (image && typeof image !== 'string') {
      // Upload new image to Cloudinary
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await cloudinary.uploader.upload_stream(
        { folder: 'categories' },
        (error, result) => {
          if (error) throw error;
          return result;
        }
      );

      // Workaround to upload buffer using a Promise
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'categories' }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          stream.end(buffer);
        });

      const result = await streamUpload();
      updateData.image = result.secure_url;
    }

    await Category.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error updating category', error: error.message });
  }
}
