import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['project','skill','experience','education','message'], required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  extra: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Item', itemSchema);
