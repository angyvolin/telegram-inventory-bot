import Person from './Person';
import PersonType from '../enums/PersonType';

export default class Stockman extends Person {
	public static async confirmSupply(): Promise<void> {
		//...
	}

	/**
	 * Confirm return
	 * @desc
	 * Смс Worker с подтверждением о возможности вернуть
	 * инструменты, а также кнопкой для подтверждения
	 * возврата
	 */
	public static confirmReturnInstrument(requestId: number): void {
		//...
	}

	public static confirmReturnFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm removing
	 * @desc Запрос на списание инструмента.
	 * Пересылается Admin на согласование
	 */
	public static confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm receipt
	 */
	public static confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
