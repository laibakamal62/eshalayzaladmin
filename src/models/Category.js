import mongoose from 'mongoose';
import slugify from 'slugify';

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, unique: true }, // unique slug field
  },
  { timestamps: true }
);

// Auto-generate slug before saving
CategorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
