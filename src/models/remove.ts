import mongoose, { Document, Schema } from 'mongoose';

export interface IRemove extends Document {
	instruments: Map<string, number>;
	created: Date;
}

// Схема получения
export const RemoveSchema: Schema = new Schema(
	{
		instruments: { type: Map, required: true },
		created: { type: Date, required: true, default: Date.now }
	},
	{ collection: 'removings' }
);

export default mongoose.model<IRemove>('Remove', RemoveSchema);
