export default abstract class Role {
	// Private
	private fullName: string; // Real full name
	private name: string; // Telegram name
	private chatId: string; // Telegram chat id

	// Public
	constructor(fullName: string, name: string, chatId: string) {
		this.fullName = fullName;
		this.name = name;
		this.chatId = chatId;
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
}
