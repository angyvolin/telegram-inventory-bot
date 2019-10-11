export enum RoleType {
	WORKER,
	STOCKMAN,
	SUPPLIER,
	CHIEF,
	ADMIN
}

export default abstract class Role {
	// Private
	private fullName: string; // Real full name
	private name: string; // Telegram name
	private chatId: string; // Telegram chat id
	private type: RoleType; // Role type

	// Public
	constructor(fullName: string, name: string, chatId: string, type: RoleType) {
		this.fullName = fullName;
		this.name = name;
		this.chatId = chatId;
		this.type = type;
	}

	// Getters
	public getFullName(): string {
		return this.fullName;
	}

	public getName(): string {
		return this.name;
	}

	public getChatId(): string {
		return this.chatId;
	}

	public getType(): RoleType {
		return this.type;
	}
}
