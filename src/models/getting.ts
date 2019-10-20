import mongoose, { Document, Schema } from 'mongoose';

export interface IGetting extends Document {
	instruments?: Map<string, number>;
	furniture?: Map<string, number>;
	consumables?: Map<string, number>;
	created: Date;
	expires?: Date;
}

// Схема получения
export const GettingSchema: Schema = new Schema(
	{
		instruments: { type: Map },
		furniture: { type: Map },
		consumables: { type: Map },
		created: { type: Date, required: true, default: Date.now },
		expires: { type: Date }
	},
	{ collection: 'gettings' }
);

export default mongoose.model<IGetting>('Getting', GettingSchema);
