import { parse, isValid } from 'date-fns';

const possibleFormats = [
	'dd/MM/yyyy',
	'd/M/yy',
	'dd-MM-yy',
	'dd-MM-yyyy',
	'do MMM yy',
	'do MMM yyyy',
	'MMMM do yy',
	'MMMM do yyyy',
	'd MMM yy',
	'd MMM yyyy',
	'yyyy-MM-dd' // fallback ISO
];

export function formatDateForSaving(input) {
	for (const format of possibleFormats) {
		let parsed = parse(input, format, new Date());
		if (isValid(parsed)) {
			parsed = adjustTwoDigitYear(parsed); // handle two digit year format (e.g., 23/12/25)
			return parsed;
		}
	}
	return null; // Return null if no valid date format found
}

// Utility function to convert two-digit year formats to full year values for accurate saving to DB
function adjustTwoDigitYear(date) {
	const year = date.getFullYear();
	if (year >= 0 && year < 100) {
		// Choose cutoff logic: 50 = 1950-2049 (like Excel)
		const correctedYear = year >= 50 ? year + 1900 : year + 2000;
		date.setFullYear(correctedYear);
	}
	return date;
}
