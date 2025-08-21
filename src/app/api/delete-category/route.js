import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import { connectMade } from '@/lib/mongodb';
import path from 'path';
import fs from 'fs';

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

    // Delete category image from uploads
    if (category.image) {
      const filePath = path.join(process.cwd(), 'public', category.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Error deleting category' });
  }
}
