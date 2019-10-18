import * as api from 'telegraf';
import Logger from '../init/logger';
import PersonType from '../enums/PersonType';
import Person, { IPerson } from '../models/person';

/**
 * Возвращает персону (имеющею
 * определенную роль)
 * @returns { Promise<IPerson> }
 */
export async function getPerson(username: string): Promise<IPerson> {
	return Person.findOne({ username });
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

	try {
		await Person.findOneAndUpdate({ username }, insertDoc, {
			upsert: true,
			new: true
		});
	} catch (err) {
		Logger.error(err);
	}
}

export async function isWorker(username: string): Promise<boolean> {
	const type = await getPersonType(username);
	if (type === PersonType.WORKER) {
		return true;
	}
	return false;
}

export async function isStockman(username: string): Promise<boolean> {
	const type = await getPersonType(username);
	if (type === PersonType.STOCKMAN) {
		return true;
	}
	return false;
}

export async function isSupplier(username: string): Promise<boolean> {
	const type = await getPersonType(username);
	if (type === PersonType.SUPPLIER) {
		return true;
	}
	return false;
}

export async function isChief(username: string): Promise<boolean> {
	const type = await getPersonType(username);
	if (type === PersonType.CHIEF) {
		return true;
	}
	return false;
}
