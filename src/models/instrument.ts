import mongoose, { Document, Schema } from 'mongoose';

export interface IInstrument extends Document {
	photo?: string;
	name: string;
	amount: number;
}

// Схема инструмента
export const InstrumentSchema: Schema = new Schema(
	{
		photo: { type: String },
		name: { type: String, required: true },
		amount: { type: Number, required: true }
	},
	{ collection: 'instruments' }
);

export default mongoose.model<IInstrument>('Instrument', InstrumentSchema);
