export type Product={id:string;name:string;category:string;description:string;price:number|null;image:string;sizes:string[];active:boolean;illustration:'abada'|'tirante'|'other';ticketEventId?:string|null;deliveryInfo?:string};
export const categories=['Roupas','Acessórios','Copos','Outros'];
export const priceLabel=(value:number|null)=>value===null?'Preço a definir':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export function productView(row:any):Product{return {...row,price:row.priceCents===null?null:row.priceCents/100,sizes:JSON.parse(row.sizes),active:Boolean(row.active)};}
export const statusLabels:Record<string,string>={creating:'Preparando pagamento',pending:'Aguardando pagamento',paid:'Pago',failed:'Não aprovado',refunded:'Reembolsado',partially_refunded:'Reembolso parcial',charged_back:'Pagamento contestado',review:'Revisar pagamentos',checkout_error:'Pagamento indisponível',cancelled:'Cancelado'};

export function categoryId(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/\s+/g,' ').trim();}
export function categoryNames(values:string[]){const unique=new Map<string,string>();for(const name of values){const text=name.replace(/\s+/g,' ').trim();if(text&&!unique.has(categoryId(text)))unique.set(categoryId(text),text);}return [...unique.values()];}
