import * as api from 'telegraf';
import Logger from '../init/logger';
import { PersonType } from '../classes/Person';
import Person, { IPerson } from '../models/person';
import Instrument, { IInstrument } from '../models/instruments';
import Furniture, { IFurniture } from '../models/furniture';
import Consumable, { IConsumable } from '../models/consumables';

/**
 * Возвращает персону (имеющею
 * определенную роль)
 * @returns { Promise<IPerson> }
 */
export async function getPerson(chatId: number): Promise<IPerson> {
	return await Person.findOne({ chatId });
}

/**
 * Возвращает роль персоны
 * @returns { Promise<PersonType> }
 */
export async function getPersonType(chatId: number): Promise<PersonType> {
	const person = await Person.findOne({ chatId });
	return person ? person.type : null;
}
