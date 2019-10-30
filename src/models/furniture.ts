import mongoose, { Document, Schema } from 'mongoose';

export interface IFurniture extends Document {
	photo?: string
	name: string
	amount: number
	measure: string
	description?: string
}

// Схема фурнитуры
export const FurnitureSchema: Schema = new Schema(
	{
		photo: { type: String },
		name: { type: String, required: true },
		amount: { type: Number, required: true },
		measure: { type: String, required: true },
		description: { type: String }
	},
	{ collection: 'furniture' }
);

export default mongoose.model<IFurniture>('Furniture', FurnitureSchema);
