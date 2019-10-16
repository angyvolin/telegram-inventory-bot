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
export async function getPerson(username: string): Promise<IPerson> {
	return await Person.findOne({ username });
}

/**
 * Возвращает роль персоны
 * @returns { Promise<PersonType> }
 */
export async function getPersonType(username: string): Promise<PersonType> {
	const person = await Person.findOne({ username });
	return person ? person.type : null;
}

export async function addPerson(type: PersonType, username: string, fullName: string): Promise<void> {
	const insertDoc: any = {
		type,
		username,
		fullName
	};

	await Person.findOneAndUpdate({ username }, insertDoc, {
		upsert: true,
		new: true
	});
}
