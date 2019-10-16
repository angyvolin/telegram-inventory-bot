import FurnitureModel from '../models/furniture';

export default class Furniture {
	public static async add(name: string, photo?: Buffer) {
		const insertDoc = {
			name,
			photo: photo ? photo : null
		};

		await FurnitureModel.findOneAndUpdate({ name }, insertDoc, {
			upsert: true,
			new: true
		});
	}

	// Getters
	public static async getId(name: string): Promise<number> {
		const furniture = await FurnitureModel.findOne({ name });
		return furniture ? furniture.id : null;
	}

	public static async getPhoto(id: number): Promise<Buffer> {
		const furniture = await FurnitureModel.findOne({ id });
		return furniture ? furniture.photo : null;
	}

	public static async getName(id: number): Promise<string> {
		const furniture = await FurnitureModel.findOne({ id });
		return furniture ? furniture.name : null;
	}

	public static async getAmount(id: number): Promise<number> {
		const furniture = await FurnitureModel.findOne({ id });
		return furniture ? furniture.amount : null;
	}
}
