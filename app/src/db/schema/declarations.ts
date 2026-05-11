import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, numeric, date } from 'drizzle-orm/pg-core';
import {
  declarationKindEnum,
  declarationStatusEnum,
  exchangeTermsEnum,
  synapseResourceTypeEnum,
} from '../enums.ts';
import { producers } from './producers.ts';

/**
 * SurplusShortageDeclaration — a producer's public statement that they
 * have a surplus to offer or a shortage they need addressed.
 *
 * This is NOT a marketplace listing. There is no pricing, no direct
 * contact, and no transaction initiated here. It is a visibility layer —
 * others can see what's available/needed in the region and propose
 * allocations through a separate consent flow.
 */
export const surplusShortageDeclarations = pgTable(
  'surplus_shortage_declarations',
  {
    id: text('id').primaryKey(),
    producerId: text('producer_id')
      .notNull()
      .references(() => producers.id, { onDelete: 'restrict' }),
    kind: declarationKindEnum('kind').notNull(),
    resourceType: synapseResourceTypeEnum('resource_type').notNull(),
    resourceDetail: text('resource_detail'),
    quantity: numeric('quantity', { precision: 10, scale: 2 }),
    unit: text('unit'),
    availableFrom: date('available_from').notNull(),
    availableUntil: date('available_until'),
    locationDescription: text('location_description'),
    exchangeTerms: exchangeTermsEnum('exchange_terms').notNull().default('free'),
    conditions: text('conditions'),
    status: declarationStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('declarations_id_ulid_length', sql`char_length(${table.id}) = 26`),
    producerIdx: index('declarations_producer_idx').on(table.producerId),
    statusKindIdx: index('declarations_status_kind_idx').on(table.status, table.kind),
    resourceTypeIdx: index('declarations_resource_type_idx').on(table.resourceType),
  }),
);

export type SurplusShortageDeclaration = typeof surplusShortageDeclarations.$inferSelect;
export type NewSurplusShortageDeclaration = typeof surplusShortageDeclarations.$inferInsert;
