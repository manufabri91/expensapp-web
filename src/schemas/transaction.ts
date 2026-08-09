import { formatISO } from 'date-fns';
import { z } from 'zod';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';

const isoDate = (date: Date) => formatISO(date, { representation: 'date' });

const baseTransactionShape = {
  id: z.number().optional(),
  amount: z.number({ error: 'Validation.invalidNumber' }).positive('Validation.positiveNumber'),
  type: z.enum(TransactionType, { error: 'Validation.required' }),
  account: z.number({ error: 'Validation.required' }),
  destinationAccount: z.number().optional(),
  category: z.number().optional(),
  subcategory: z.number().optional(),
  description: z.string().optional(),
  excludeFromTotals: z.boolean().default(false),
};

type BaseTransactionFields = {
  type: TransactionType;
  account: number;
  destinationAccount?: number;
  category?: number;
  subcategory?: number;
  description?: string;
};

const refineTransferOrCategoryFields = (data: BaseTransactionFields, ctx: z.RefinementCtx) => {
  if (data.type === TransactionType.TRANSFER) {
    if (!data.destinationAccount) {
      ctx.addIssue({ code: 'custom', message: 'Validation.transferDestinationRequired', path: ['destinationAccount'] });
    } else if (data.destinationAccount === data.account) {
      ctx.addIssue({ code: 'custom', message: 'Validation.transferSameAccount', path: ['destinationAccount'] });
    }
    return;
  }
  if (!data.category) {
    ctx.addIssue({ code: 'custom', message: 'Validation.required', path: ['category'] });
  }
  if (!data.subcategory) {
    ctx.addIssue({ code: 'custom', message: 'Validation.required', path: ['subcategory'] });
  }
  if (!data.description) {
    ctx.addIssue({ code: 'custom', message: 'Validation.required', path: ['description'] });
  }
};

export const oneTimeTransactionSchema = z
  .object({
    ...baseTransactionShape,
    eventDate: z.date({ error: 'Validation.required' }),
  })
  .superRefine(refineTransferOrCategoryFields)
  .transform((data) => ({
    id: data.id,
    amount: Math.abs(data.amount),
    eventDate: isoDate(data.eventDate),
    description: data.type === TransactionType.TRANSFER ? undefined : data.description,
    accountId: data.account,
    categoryId: data.type === TransactionType.TRANSFER ? undefined : data.category,
    subcategoryId: data.type === TransactionType.TRANSFER ? undefined : data.subcategory,
    type: data.type,
    excludeFromTotals: data.excludeFromTotals,
    destinationAccountId: data.type === TransactionType.TRANSFER ? data.destinationAccount : undefined,
  }));

export const recurringTransactionSchema = z
  .object({
    ...baseTransactionShape,
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE], { error: 'Validation.required' }),
    frequency: z.enum(RecurrenceFrequency, { error: 'Validation.required' }),
    intervalDays: z.number().optional(),
    daysOfMonth: z.array(z.number()).default([]),
    startDate: z.date({ error: 'Validation.required' }),
    endDate: z.date().optional(),
    hasEndDate: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    refineTransferOrCategoryFields(data, ctx);
    if (data.frequency === RecurrenceFrequency.INTERVAL_DAYS && (!data.intervalDays || data.intervalDays < 1)) {
      ctx.addIssue({ code: 'custom', message: 'Validation.intervalDaysRequired', path: ['intervalDays'] });
    }
    if (data.frequency === RecurrenceFrequency.MONTHLY_DAYS && data.daysOfMonth.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Validation.daysOfMonthRequired', path: ['daysOfMonth'] });
    }
    if (data.hasEndDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({ code: 'custom', message: 'Validation.endDateBeforeStart', path: ['endDate'] });
    }
  })
  .transform((data) => ({
    id: data.id,
    type: data.type,
    amount: Math.abs(data.amount),
    description: data.description ?? '',
    accountId: data.account,
    categoryId: data.category,
    subcategoryId: data.subcategory,
    frequency: data.frequency,
    intervalDays: data.frequency === RecurrenceFrequency.INTERVAL_DAYS ? data.intervalDays : undefined,
    daysOfMonth: data.frequency === RecurrenceFrequency.MONTHLY_DAYS ? data.daysOfMonth : undefined,
    startDate: isoDate(data.startDate),
    endDate: data.hasEndDate && data.endDate ? isoDate(data.endDate) : null,
    excludeFromTotals: data.excludeFromTotals,
  }));

export type OneTimeTransactionFormInput = z.input<typeof oneTimeTransactionSchema>;
export type OneTimeTransactionFormOutput = z.output<typeof oneTimeTransactionSchema>;
export type RecurringTransactionFormInput = z.input<typeof recurringTransactionSchema>;
export type RecurringTransactionFormOutput = z.output<typeof recurringTransactionSchema>;

// Server-side re-validation: dates already arrive as ISO strings from the client's transformed
// payload, and ids/numbers are already numbers, so this mirrors the *output* shape of the schemas
// above rather than the raw form-input shape.
export const transactionServerSchema = z.object({
  id: z.number().optional(),
  amount: z.number().positive(),
  eventDate: z.string().optional(),
  description: z.string().optional(),
  accountId: z.number(),
  categoryId: z.number().optional(),
  subcategoryId: z.number().optional(),
  type: z.enum(TransactionType),
  excludeFromTotals: z.boolean().default(false),
  destinationAccountId: z.number().optional(),
});

export const recurringTransactionServerSchema = z.object({
  id: z.number().optional(),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  amount: z.number().positive(),
  description: z.string(),
  accountId: z.number(),
  categoryId: z.number(),
  subcategoryId: z.number(),
  frequency: z.enum(RecurrenceFrequency),
  intervalDays: z.number().optional(),
  daysOfMonth: z.array(z.number()).optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  excludeFromTotals: z.boolean().default(false),
});
