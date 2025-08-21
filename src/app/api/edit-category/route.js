import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectMade } from '@/lib/mongodb';
import path from 'path';
import fs from 'fs';
import slugify from 'slugify';

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
      slug: slugify(name, { lower: true, strict: true }), // regenerate slug
    };

    if (image && typeof image !== 'string') {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public/uploads/categories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${image.name}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      updateData.image = `uploads/categories/${filename}`;
    }

    await Category.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error updating category' });
  }
}
