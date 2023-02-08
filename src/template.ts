import Handlebars from 'handlebars';
import fs from 'fs';
const rawFile = fs.readFileSync('./src/email.hbs', 'utf8');

export const createTemplate = ({ cid, title, message, date, firstResults, url }: any) => {
    const template = Handlebars.compile(rawFile);
    return template({ cid, title, message, date, firstResults, url });
}

