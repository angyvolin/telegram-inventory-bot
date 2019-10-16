import mongoose, { Document, Schema } from 'mongoose';

export interface IInstrument extends Document {
	id: number;
	photo?: string;
	name: string;
	amount: number;
}

// Схема инструмента
export const InstrumentSchema: Schema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		photo: {type: String},
		name: { type: String, required: true },
		amount: { type: Number, required: true }
	},
	{ collection: 'instruments' }
);

export default mongoose.model<IInstrument>('Instrument', InstrumentSchema);
