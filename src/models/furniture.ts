import mongoose, { Document, Schema } from 'mongoose';

export interface IFurniture extends Document {
	id: number;
	photo?: string;
	name: string;
	amount: number;
}

// Схема инструмента
export const FurnitureSchema: Schema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		photo: { type: String },
		name: { type: String, required: true },
		amount: { type: Number, required: true }
	},
	{ collection: 'furniture' }
);

export default mongoose.model<IFurniture>('Furniture', FurnitureSchema);
