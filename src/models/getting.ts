import mongoose, { Document, Schema } from 'mongoose';

export interface IGetting extends Document {
	type: number;
	items: Map<string, number>;
	created: Date;
	expires?: Date;
}

// Схема получения
export const GettingSchema: Schema = new Schema(
	{
		type: { type: Number, required: true },
		items: { type: Map, required: true },
		created: { type: Date, required: true, default: Date.now },
		expires: { type: Date }
	},
	{ collection: 'gettings' }
);

export default mongoose.model<IGetting>('Getting', GettingSchema);
