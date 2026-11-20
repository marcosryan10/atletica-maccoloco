import {adminEmail} from './maccoloco';
export function isMaccoAdmin(email:string){return email.toLowerCase()===adminEmail;}
