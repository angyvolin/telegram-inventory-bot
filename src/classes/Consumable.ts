import ConsumableModel from '../models/consumable';

export default class Consumable {
	// Getters
	public static async getId(name: string): Promise<number> {
		const consumable = await ConsumableModel.findOne({ name });
		return consumable ? consumable.id : null;
	}

	public static async getPhoto(id: number): Promise<Buffer> {
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
