import ConsumableModel, { IConsumable } from '../models/consumable';

export default class Consumable {
	public static async add(name: string, photoId?: string) {
		const consumable = new ConsumableModel({
			name,
			amount: 0,
			photo: photoId ? photoId : null
		});

		await consumable.save();
	}

	// Getters
	public static async getAllItems(filter = {}): Promise<IConsumable[]> {
		return ConsumableModel.find(filter);
	}

	public static async getId(name: string): Promise<number> {
		const consumable = await ConsumableModel.findOne({ name });
		return consumable ? consumable.id : null;
	}

	public static async getItem(id: string): Promise<IConsumable> {
		const consumable = await ConsumableModel.findById(id);
		return consumable ? consumable : null;
	}

	public static async getPhoto(id: number): Promise<string> {
		const consumable = await ConsumableModel.findOne({ id });
		return consumable ? consumable.photo : null;
	}

	public static async getName(id: number): Promise<string> {
		const consumable = await ConsumableModel.findOne({ id });
		return consumable ? consumable.name : null;
	}

	public static async getAmount(id: number): Promise<number> {
		const consumable = await ConsumableModel.findOne({ id });
		return consumable ? consumable.amount : null;
	}
}
