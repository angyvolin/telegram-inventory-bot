import PersonType from '../enums/PersonType';
import ItemType from '../enums/ItemType';

export type ItemRequested = { type: ItemType; id: string; amount: number };
export type ItemCells = { cellName: string, name: string };

export default abstract class Person {
	// Getters
	public static async getFullName(): Promise<string> {
		return null;
	}

	public static async getUsername(): Promise<string> {
		return null;
	}

	public static async getType(): Promise<PersonType> {
		return null;
	}
}
