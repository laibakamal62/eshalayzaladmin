import mongoose from "mongoose";

// Clear Mongoose model cache to ensure updated schema is used
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const VariationSchema = new mongoose.Schema({
  name: { type: String },
  color: { type: String },
  price: { type: String, required: true },
  stock: { type: String },
  image: { type: String },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  stock: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String }, // ✅ Brand added
  image: { type: String, required: true },
  description: { type: String },
  variations: [VariationSchema],
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);
