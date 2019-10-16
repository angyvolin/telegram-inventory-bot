import mongoose, { Document, Schema } from 'mongoose';

export interface IRemove extends Document {
	items: Map<string, number>,
	created: Date
}

// Схема получения
export const RemoveSchema: Schema = new Schema({
	items: { type: Map, required: true },
	created: { type: Date, required: true, default: Date.now }
}, { collection: 'removings' });

export default mongoose.model<IPerson>('Remove', RemoveSchema);
