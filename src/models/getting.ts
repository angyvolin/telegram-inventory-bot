import mongoose, { Document, Schema } from 'mongoose';

export interface IGetting extends Document {
	//...
}

/*import mongoose, { Document, Schema } from 'mongoose';

export interface IPerson extends Document {
	fullName: string; // Real full name // Telegram name
	username: string; // Telegram username
	type: number;
}

// Схема персоны (имеющей определенную роль)
export const PersonSchema: Schema = new Schema(
	{
		fullName: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		type: { type: Number, required: true, unique: false }
	},
	{ collection: 'persons' }
);

export default mongoose.model<IPerson>('Person', PersonSchema);
*/
