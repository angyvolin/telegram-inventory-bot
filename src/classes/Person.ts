import PersonType from '../enums/PersonType';

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
