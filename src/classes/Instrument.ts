import InstrumentModel, { IInstrument } from '../models/instrument';

export default class Instrument {
	public static async add(name: string, photoId?: string) {
		const instrument = new InstrumentModel({
			name,
			amount: 0,
			photo: photoId ? photoId : null
		});

		await instrument.save();
	}

	// Getters
	public static async getAllItems(filter = {}): Promise<IInstrument[]> {
		return InstrumentModel.find(filter);
	}

	public static async getId(name: string): Promise<number> {
		const instrument = await InstrumentModel.findOne({ name });
		return instrument ? instrument.id : null;
	}

	public static async getItem(id: string): Promise<IInstrument> {
		const instrument = await InstrumentModel.findById(id);
		return instrument ? instrument : null;
	}

	public static async getPhoto(id: number): Promise<string> {
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
