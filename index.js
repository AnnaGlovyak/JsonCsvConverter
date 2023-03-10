import fs from "fs";
import nodePath from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

const translationDirName = "app/src/i18n"; // path to folder with translation
const primaryLang = "uk"; // lang that absolutely has all keys you need

const arr = __dirname.split("/");
arr.pop();
arr.push(translationDirName);
const langsFullPath = arr.join("/");
console.log("langsFullPath", langsFullPath);

const files = fs.readdirSync(langsFullPath)
	.map(fileName => {
		return nodePath.join(langsFullPath, fileName);
	});
console.log("files", files);

let convertedData;
const total = {};

Promise.all([...files.map(f => importData(f))])
	.then(res => {
		const langKeys = files.map(el => el.split("/").pop().split(".")[0]);
		convertedData = [...res.map((el, index) => { return {transKey: langKeys[index], data: convert(el, langKeys[index])};})];

		const primaryLangKeys = convertedData.find(el => el.transKey === primaryLang);

		for (const [key, value] of Object.entries(primaryLangKeys.data)) {
			total[key] = {
				...convertedData.reduce((acc, cur) => {
					acc = {
						...acc,
						[cur.transKey]: cur.data[key] || "",
					};
					return acc;
				}, {}),
			};
		}

		// TODO: create csv file
		fs.appendFile("test.json", JSON.stringify(total), err => {
			if (err) {
				console.error(err);
			}
			// file written successfully
		});

	}).catch(err => console.log(err));



function importData (filePath) {
	const data = fs.readFileSync(filePath);
	return JSON.parse(data);
}

function convert (data, langKey) {
	let result = {};

	result.translationKey = langKey;

	function formateJson (obj, rememberKeys = []) {
		for (const [key, value] of Object.entries(obj)) {

			if (typeof value === "object") {
				formateJson(value, [...rememberKeys, key]);
			}
			else {
				const keyName = [...rememberKeys, key].join(".");
				result[keyName] = value;
			}
		}
		return result;
	}

	return formateJson(data, []);
}


// on output has json file (test.js) with nested keys writed by dots.Looks like:
//    "confirm.orderSum": {
//         "en": "Order",
//         "ru": "??????????",
//         "uk": "????????????????????"
//     },
//     "confirm.delivery": {
//         "en": "Delivery",
//         "ru": "????????????????",
//         "uk": "????????????????"
//     },
//     "confirm.totalToPay": {
//         "en": "Grand total",
//         "ru": "?????????? ?? ????????????",
//         "uk": "?????????? ???? ????????????"
//     },
//     "confirm.button.showAll": {
//         "en": "Expand",
//         "ru": "????????????????????",
//         "uk": "????????????????????"
//     },
//     "confirm.button.hide": {
//         "en": "Collapse",
//         "ru": "????????????????",
//         "uk": "????????????????"
//     },
//     "confirm.button.confirmOrder": {
//         "en": "Confirm order",
//         "ru": "?????????????????????? ??????????",
//         "uk": "?????????????????????? ????????????????????"
//     },
//     "form.title": {
//         "en": "Contact details",
//         "ru": "???????????????????? ????????????",
//         "uk": "?????????????????? ????????"
//     },
//     "form.name": {
//         "en": "Name",
//         "ru": "??????",
//         "uk": "????????"
//     },
//     "form.phone": {
//         "en": "Phone number",
//         "ru": "?????????? ????????????????",
//         "uk": "?????????? ????????????????"
//     },
//     "form.comment": {
//         "en": "Order comment",
//         "ru": "?????????????????????? ?? ????????????",
//         "uk": "???????????????? ???? ????????????????????"
//     },
//     "form.address": {
//         "en": "Address, house number",
//         "ru": "?????????? ????????????????",
//         "uk": "???????????? ???? ?????????? ??????????????"
//     },
//     "form.addressMore": {
//         "en": "Entrance, floor, apartment",
//         "ru": "?????????? ????????????????",
//         "uk": "??????'??????, ????????????, ?????????? ????????????????"
//     },