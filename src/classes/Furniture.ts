import FurnitureModel, { IFurniture } from '../models/furniture';

export default class Furniture {
	public static async add(name: string, photoId?: string) {
		const furniture = new FurnitureModel({
			name,
			amount: 0,
			photo: photoId ? photoId : null
		});

		await furniture.save();
	}

	// Getters
	public static async getAllItems(filter = {}): Promise<IFurniture[]> {
		return FurnitureModel.find(filter);
	}

	public static async getItem(name: string): Promise<IFurniture> {
		const furniture = await FurnitureModel.findOne({name});
		return furniture ? furniture : null;
	}

	public static async getId(name: string): Promise<number> {
		const furniture = await FurnitureModel.findOne({ name });
		return furniture ? furniture.id : null;
	}

	public static async getPhoto(id: number): Promise<string> {
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
