import InstrumentModel from '../models/instrument';

export default class Instrument {
	public static async add(name: string, photo?: Buffer) {
		const insertDoc = {
			name,
			photo: photo ? photo : null
		};

		await InstrumentModel.findOneAndUpdate({ name }, insertDoc, {
			upsert: true,
			new: true
		});
	}

	// Getters
	public static async getId(name: string): Promise<number> {
		const instrument = await InstrumentModel.findOne({ name });
		return instrument ? instrument.id : null;
	}

	public static async getPhoto(id: number): Promise<Buffer> {
		const instrument = await InstrumentModel.findOne({ id });
		return instrument ? instrument.photo : null;
	}

	public static async getName(id: number): Promise<string> {
		const instrument = await InstrumentModel.findOne({ id });
		return instrument ? instrument.name : null;
	}

	public static async getAmount(id: number): Promise<number> {
		const instrument = await InstrumentModel.findOne({ id });
		return instrument ? instrument.amount : null;
	}
}
