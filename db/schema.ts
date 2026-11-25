import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const applications = sqliteTable('athlete_applications', {
 id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(), phone: text('phone').notNull(),
 course: text('course').notNull(), semester: text('semester').notNull(), sports: text('sports').notNull(), experience: text('experience').notNull(),
 availability: text('availability').notNull(), status: text('status').notNull().default('Nova'), consent: integer('consent').notNull(),
 createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
});
export const publications = sqliteTable('publications', {
 id: text('id').primaryKey(), kind: text('kind').notNull(), title: text('title').notNull(), category: text('category').notNull(),
 image:text('image').notNull().default(''),imageAlt:text('image_alt').notNull().default(''),
 summary: text('summary').notNull(), body: text('body').notNull(), date: text('date').notNull(), location: text('location').notNull().default(''),
 published: integer('published').notNull().default(0), updatedAt: text('updated_at').notNull(),
});
export const partners = sqliteTable('partners', {
 id:text('id').primaryKey(), name:text('name').notNull(), description:text('description').notNull(),
 image:text('image').notNull(), url:text('url').notNull().default(''), published:integer('published').notNull().default(0), updatedAt:text('updated_at').notNull(),
});
export const shopProducts=sqliteTable('shop_products',{
 ticketEventId:text('ticket_event_id'),
 id:text('id').primaryKey(),name:text('name').notNull(),category:text('category').notNull(),description:text('description').notNull(),
 priceCents:integer('price_cents'),image:text('image').notNull().default(''),sizes:text('sizes').notNull(),active:integer('active').notNull().default(0),
 illustration:text('illustration').notNull().default('other'),deliveryInfo:text('delivery_info').notNull().default(''),updatedAt:text('updated_at').notNull(),
});
export const shopOrders=sqliteTable('shop_orders',{
 ticketEventId:text('ticket_event_id'),
 customerUserId:text('customer_user_id'),
 id:text('id').primaryKey(),requestKey:text('request_key').notNull(),ownerHash:text('owner_hash').notNull(),buyer:text('buyer').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),
 productId:text('product_id').notNull(),productName:text('product_name').notNull(),size:text('size').notNull(),quantity:integer('quantity').notNull(),unitCents:integer('unit_cents').notNull(),totalCents:integer('total_cents').notNull(),
 paymentMethod:text('payment_method').notNull().default('legacy'),pixPayload:text('pix_payload'),receiverName:text('receiver_name'),deliveryInfo:text('delivery_info').notNull().default(''),confirmedAt:text('confirmed_at'),confirmedBy:text('confirmed_by'),paymentNote:text('payment_note'),
 status:text('status').notNull().default('creating'),fulfillment:text('fulfillment').notNull().default('Pendente'),mode:text('mode').notNull(),preferenceId:text('preference_id'),checkoutUrl:text('checkout_url'),
 consentAt:text('consent_at').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[uniqueIndex('shop_order_request_idx').on(t.requestKey),index('shop_order_created_idx').on(t.createdAt),index('shop_order_customer_idx').on(t.customerUserId,t.createdAt)]);
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

export const shopManualConfig=sqliteTable('shop_manual_config',{id:text('id').primaryKey(),pixKey:text('pix_key').notNull().default(''),receiverName:text('receiver_name').notNull().default(''),receiverCity:text('receiver_city').notNull().default(''),pixEnabled:integer('pix_enabled').notNull().default(0),cashEnabled:integer('cash_enabled').notNull().default(0),updatedAt:text('updated_at').notNull()});

export const shopCategories=sqliteTable('shop_categories',{id:text('id').primaryKey(),name:text('name').notNull(),createdAt:text('created_at').notNull()});
export const directionAccess=sqliteTable('direction_access',{
 id:text('id').primaryKey(),email:text('email').notNull().unique(),name:text('name').notNull(),permissions:text('permissions').notNull().default('[]'),
 active:integer('active').notNull().default(1),authUserId:text('auth_user_id'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
});
export const directionAccessAudit=sqliteTable('direction_access_audit',{
 id:text('id').primaryKey(),actorId:text('actor_id').notNull(),actorEmail:text('actor_email').notNull(),memberId:text('member_id').notNull(),action:text('action').notNull(),permissions:text('permissions').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('direction_access_audit_member').on(t.memberId,t.createdAt)]);
export const customerNotifications=sqliteTable('customer_notifications',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),orderId:text('order_id').notNull(),eventKey:text('event_key').notNull().unique(),title:text('title').notNull(),body:text('body').notNull(),readAt:text('read_at'),createdAt:text('created_at').notNull(),
},t=>[index('customer_notification_owner').on(t.userId,t.createdAt)]);

export const ticketEvents=sqliteTable('ticket_events',{
 id:text('id').primaryKey(),name:text('name').notNull(),startsAt:text('starts_at').notNull(),location:text('location').notNull().default(''),
 salesOpen:integer('sales_open').notNull().default(1),updatedAt:text('updated_at').notNull(),
});
export const eventTickets=sqliteTable('event_tickets',{
 id:integer('id').primaryKey({autoIncrement:true}),token:text('token').notNull().unique(),eventId:text('event_id').notNull(),orderId:text('order_id').notNull(),ordinal:integer('ordinal').notNull(),createdAt:text('created_at').notNull(),
 usedAt:text('used_at'),usedBy:text('used_by'),checkinNonce:text('checkin_nonce'),revokedAt:text('revoked_at'),revokedBy:text('revoked_by'),revokeReason:text('revoke_reason'),
},t=>[uniqueIndex('event_ticket_order_ordinal').on(t.orderId,t.ordinal),index('event_ticket_event').on(t.eventId,t.id)]);
export const ticketDeliveries=sqliteTable('ticket_deliveries',{
 orderId:text('order_id').primaryKey(),status:text('status').notNull().default('pending'),attempts:integer('attempts').notNull().default(0),lockToken:text('lock_token'),lockedAt:text('locked_at'),sentAt:text('sent_at'),lastError:text('last_error'),updatedAt:text('updated_at').notNull(),
});
export const ticketAudit=sqliteTable('ticket_audit',{
 id:text('id').primaryKey(),ticketId:integer('ticket_id').notNull(),actor:text('actor').notNull(),action:text('action').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('ticket_audit_ticket').on(t.ticketId,t.createdAt)]);

export const paymentConfigAudit=sqliteTable('payment_config_audit',{
 id:text('id').primaryKey(),actorId:text('actor_id').notNull(),actorEmail:text('actor_email').notNull(),receiverFingerprint:text('receiver_fingerprint').notNull(),pixEnabled:integer('pix_enabled').notNull(),cashEnabled:integer('cash_enabled').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('payment_config_audit_created').on(t.createdAt)]);
