import mongoose, { Document, Schema } from 'mongoose';

export interface IInstrument extends Document {
	photo?: string
	name: string
	amount: number
	measure: string
	description?: string
}

// Схема инструмента
export const InstrumentSchema: Schema = new Schema(
	{
		photo: { type: String },
		name: { type: String, required: true },
		amount: {type: Number, required: true},
		measure: {type: String, required: true},
		description: {type: String}
	},
	{ collection: 'instruments' }
);

export default mongoose.model<IInstrument>('Instrument', InstrumentSchema);
