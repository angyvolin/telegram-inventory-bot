import mongoose, { Document, Schema } from 'mongoose';

export interface ICell extends Document {
	row: string;
	col: number;
	instruments?: Map<string, number>;
	furniture?: Map<string, number>;
	consumables?: Map<string, number>;
}

// Схема ячейки
export const CellSchema: Schema = new Schema(
	{
		row: { type: String, required: true },
		col: { type: Number, required: true },
		instruments: { type: Map },
		furniture: { type: Map },
		consumables: { type: Map }
	},
	{ collection: 'cells' }
);

export default mongoose.model<ICell>('Cell', CellSchema);