import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const applications = sqliteTable('athlete_applications', {
 id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(), phone: text('phone').notNull(),
 course: text('course').notNull(), semester: text('semester').notNull(), sports: text('sports').notNull(), experience: text('experience').notNull(),
 availability: text('availability').notNull(), status: text('status').notNull().default('Nova'), consent: integer('consent').notNull(),
 createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
});
export const publications = sqliteTable('publications', {
 id: text('id').primaryKey(), kind: text('kind').notNull(), title: text('title').notNull(), category: text('category').notNull(),
 summary: text('summary').notNull(), body: text('body').notNull(), date: text('date').notNull(), location: text('location').notNull().default(''),
 published: integer('published').notNull().default(0), updatedAt: text('updated_at').notNull(),
});
export const partners = sqliteTable('partners', {
 id:text('id').primaryKey(), name:text('name').notNull(), description:text('description').notNull(),
 image:text('image').notNull(), url:text('url').notNull().default(''), published:integer('published').notNull().default(0), updatedAt:text('updated_at').notNull(),
});
export const shopProducts=sqliteTable('shop_products',{
 id:text('id').primaryKey(),name:text('name').notNull(),category:text('category').notNull(),description:text('description').notNull(),
 priceCents:integer('price_cents'),image:text('image').notNull().default(''),sizes:text('sizes').notNull(),active:integer('active').notNull().default(0),
 illustration:text('illustration').notNull().default('other'),deliveryInfo:text('delivery_info').notNull().default(''),updatedAt:text('updated_at').notNull(),
});
export const shopOrders=sqliteTable('shop_orders',{
 id:text('id').primaryKey(),requestKey:text('request_key').notNull(),ownerHash:text('owner_hash').notNull(),buyer:text('buyer').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),
 productId:text('product_id').notNull(),productName:text('product_name').notNull(),size:text('size').notNull(),quantity:integer('quantity').notNull(),unitCents:integer('unit_cents').notNull(),totalCents:integer('total_cents').notNull(),
 status:text('status').notNull().default('creating'),fulfillment:text('fulfillment').notNull().default('Pendente'),mode:text('mode').notNull(),preferenceId:text('preference_id'),checkoutUrl:text('checkout_url'),
 consentAt:text('consent_at').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[uniqueIndex('shop_order_request_idx').on(t.requestKey),index('shop_order_created_idx').on(t.createdAt)]);
export const shopPayments=sqliteTable('shop_payments',{
 id:text('id').primaryKey(),orderId:text('order_id').notNull(),status:text('status').notNull(),amountCents:integer('amount_cents').notNull(),refundedCents:integer('refunded_cents').notNull().default(0),providerUpdatedAt:text('provider_updated_at').notNull(),
},t=>[index('shop_payment_order_idx').on(t.orderId)]);
export const shopConfig=sqliteTable('shop_payment_config',{
 id:text('id').primaryKey(),encryptedCredentials:text('encrypted_credentials').notNull(),collectorId:text('collector_id').notNull(),receiverLabel:text('receiver_label').notNull(),mode:text('mode').notNull(),
 testPaidAt:text('test_paid_at'),webhookAt:text('webhook_at'),updatedAt:text('updated_at').notNull(),
});
export const shopRateLimits=sqliteTable('shop_rate_limits',{
 id:text('id').primaryKey(),hits:integer('hits').notNull(),expiresAt:integer('expires_at').notNull(),
});
