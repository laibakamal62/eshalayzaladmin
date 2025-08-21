import { connectMade } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectMade();
    const categories = await Category.find().sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ success: true, data: categories }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // ⬅️ allow all origins for now
        },
      }
    );
  } catch (err) {
    console.error('Error fetching categories:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Error fetching categories' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
