import Person from './Person';
import { PersonType } from './Person';

export default class Worker extends Person {
	// Public
	constructor(fullName: string, name: string, username: string) {
		super(fullName, name, username, PersonType.WORKER);
	}

	/*
	 * Request getting
	 */
	public requestGettingInstrument(instruments: Map<number, number>): void {
		//...
	}

	public requestGettingFurniture(furniture: Map<number, number>): void {
		//...
	}

	public requestGettingConsumable(consumables: Map<number, number>): void {
		//...
	}

	/*
	 * Confirm
	 */

	/**
	 * @param {string} gettingInfo - JSON с информацией
	 * о получении (тип получения, длительность, объекты
	 * для получения)
	 * @desc После подтверждения создаем новый Request в БД
	 * с его requestId. В зависимости от данных в gettingInfo
	 * заполняем информацию о Request в БД
	 */
	public confirmReceipt(gettingInfo: string): void {
		//...
	}

	/**
	 * @desc После данного подтверждения возврата инструмента
	 * в БД отмечаем Request как завершенный (инструменты были
	 * возвращены)
	 */
	public confirmReturnInstrument(requestId: number): void {
		//...
	}

	/**
	 * @desc После данного подтверждения возврата фурнитуры
	 * есть два варианта:
	 *	1.	Можем создать коллекцию Return, в которую будем писать
	 *		возвраты (как инструментов, так и фурнитуры)
	 *	2.	Можем создать новый Request с типом "Возврат", куда
	 *		напишем информацию про возврат именно фурнитуры (т.к.
	 *		про инструменты инфа хранится в первичных Request
	 *		на получение)
	 */
	public confirmReturnFurniture(requestId: number): void {
		//...
	}

	/*
	 * Request return
	 */

	/**
	 * @desc Запрос на возврат инструмента. Аргументом передаем
	 * requestId для того, чтобы мы могли узнать, к какому запросу
	 * на получения относятся инструменты и отметить этот запрос
	 * как завершенный (инструменты были возвращены)
	 */
	public requestReturnInstrument(requestId: number): void {
		//...
	}

	/**
	 * @desc Запрос на возврат фурнитуры. Поскольку фурнитура
	 * не обязательна для возврата, то и requestId не передается.
	 * Передаем лишь саму фурнитуру для возврата
	 */
	public requestReturnFurniture(furniture: Map<number, number>): void {
		//...
	}

	/*
	 * Request removing
	 */

	/**
	 * @desc Запрос на списание инструмента. Первым аргументом передаем
	 * requestId для того, чтобы мы могли узнать, к какому запросу
	 * на получения относятся инструменты (чтобы не требовать их
	 * возвращения в будущем). Вторым аргументом передаем пары с
	 * инструментами и количеством
	 */
	public requestRemovingInstrument(requestId: number, items: Map<number, number>): void {
		//...
	}
}
