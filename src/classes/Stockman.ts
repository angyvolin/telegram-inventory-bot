import Person from './Person';
import { PersonType } from './Person';

export default class Stockman extends Person {
	// Public
	constructor(fullName: string, name: string, username: string) {
		super(fullName, name, username, PersonType.STOCKMAN);
	}

	/**
	 * Confirm getting
	 * @desc (Для каждой из трех функций ниже)
	 * После подтверждения отправляем уведомление Worker о
	 * возможности получения с кнопкой, с помощью которой он
	 * сможет подтвердить получение. По нажатию на эту кнопку
	 * боту будет отправляться JSON с информацией о получении
	 */
	public confirmGettingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	public confirmGettingFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	public confirmGettingConsumable(username: string, consumables: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm return
	 * @desc
	 * Смс Worker с подтверждением о возможности вернуть
	 * инструменты, а также кнопкой для подтверждения
	 * возврата
	 */
	public confirmReturnInstrument(requestId: number): void {
		//...
	}

	public confirmReturnFurniture(username: string, furniture: Map<number, number>): void {
		//...
	}

	/**
	 * Confirm removing
	 * @desc Запрос на списание инструмента.
	 * Пересылается Admin на согласование
	 */
	public confirmRemovingInstrument(username: string, instruments: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm receipt
	 */
	public confirmReceipt(items: Map<number, number>): void {
		//...
	}
}
