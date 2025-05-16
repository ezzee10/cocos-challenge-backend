export function validateEnum(value: any, enumType: object, fieldName: string) {
	const validValues = Object.values(enumType).join(', ');

	if (!Object.values(enumType).includes(value)) {
		throw new Error(
			`${fieldName} must be a valid value from the enum. Valid values are: ${validValues}`,
		);
	}
}

export function validatePositiveInteger(value: number, fieldName: string) {
	if (typeof value !== 'number' || value <= 0 || !Number.isInteger(value)) {
		throw new Error(`${fieldName} must be a positive integer`);
	}
}

export function validateDatetime(value: Date, fieldName: string) {
	if (!(value instanceof Date) || isNaN(value.getTime())) {
		throw new Error(`${fieldName} must be a valid Date object`);
	}
}

export function validateNonEmptyString(value: string, fieldName: string) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${fieldName} must be a non-empty string`);
	}
}
