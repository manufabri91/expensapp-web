'use client';
import { Modal, Spinner } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { Button } from '@/components/Button';
import { TransactionType } from '@/types/enums/transactionType';
import { DiscardTransactionDialog } from './components/DiscardTransactionDialog';
import { TransactionAmountStep } from './components/TransactionAmountStep';
import { TransactionDetailsFields } from './components/TransactionDetailsFields';
import { useTransactionForm } from './TransactionFormProvider';
import { useTransactionDraft } from './useTransactionDraft';
import { useTransactionSubmit } from './useTransactionSubmit';

export const TransactionForm = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { overlayState, clearForm } = useTransactionForm();
  const draft = useTransactionDraft();
  const { form, mode, setMode, step, setStep, calculator } = draft;
  const { onValid, saveError, setSaveError } = useTransactionSubmit({
    form,
    mode,
    setMode,
    buildOneTimeDefaults: draft.defaults.buildOneTimeDefaults,
  });
  const [discardOpen, setDiscardOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const { isSubmitting } = form.formState;
  useEffect(() => {
    if (!overlayState.isOpen) {
      setDiscardOpen(false);
      setSaveError('');
      return;
    }
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      opener.current?.focus();
    };
  }, [overlayState.isOpen]);
  useEffect(() => {
    if (step === 'details') body.current?.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
  }, [step]);
  const close = () => {
    clearForm();
    overlayState.close();
  };
  const requestClose = (open: boolean) => {
    if (open || isSubmitting) return;
    if (draft.dirty) setDiscardOpen(true);
    else close();
  };
  if (!overlayState.isOpen) return null;
  const canContinue = draft.accountsValid && calculator.result.value !== undefined;
  const amount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: draft.selectedAccount?.currency ?? 'USD',
  }).format(form.getValues('amount'));
  return (
    <>
      <Modal>
        <Modal.Backdrop
          variant="blur"
          isOpen={overlayState.isOpen}
          onOpenChange={requestClose}
          isDismissable={!isSubmitting}
          isKeyboardDismissDisabled={isSubmitting}
        >
          <Modal.Container scroll="inside" className="transaction-container">
            <Modal.Dialog className="transaction-dialog">
              <Modal.CloseTrigger isDisabled={isSubmitting} aria-label={t('AmountFlow.close')} />
              <Modal.Header className="shrink-0">
                <div className="flex items-center gap-2 pr-8">
                  {step === 'details' && (
                    <Button
                      type="button"
                      variant="ghost"
                      isIconOnly
                      aria-label={t('AmountFlow.back')}
                      isDisabled={isSubmitting}
                      onPress={() => setStep('amount')}
                    >
                      <HiArrowLeft />
                    </Button>
                  )}
                  <Modal.Heading className="text-2xl font-semibold">
                    {step === 'amount'
                      ? t(draft.isEditing ? 'AmountFlow.editTransaction' : 'AmountFlow.newTransaction')
                      : t('AmountFlow.detailsTitle')}
                  </Modal.Heading>
                </div>
                <p className="text-muted text-sm">{t('AmountFlow.step', { step: step === 'amount' ? 1 : 2 })}</p>
              </Modal.Header>
              <FormProvider {...form}>
                <form
                  noValidate
                  className="flex min-h-0 flex-1 flex-col"
                  onSubmit={(event) => {
                    if (isSubmitting) {
                      event.preventDefault();
                      return;
                    }
                    if (step === 'amount') {
                      event.preventDefault();
                      draft.continueToDetails();
                      return;
                    }
                    if (!draft.accountsValid) {
                      event.preventDefault();
                      setStep('amount');
                      return;
                    }
                    setSaveError('');
                    void form.handleSubmit(onValid)(event);
                  }}
                >
                  <Modal.Body ref={body} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                    {step === 'amount' ? (
                      <TransactionAmountStep draft={draft} />
                    ) : (
                      <>
                        <div className="bg-surface flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                          <div className="min-w-0">
                            <p className="text-muted text-sm break-words">
                              {t(
                                `Generics.${draft.type === TransactionType.EXPENSE ? 'expense' : draft.type === TransactionType.INCOME ? 'income' : 'transfer'}.singular`
                              )}{' '}
                              · {draft.selectedAccount?.name}
                              {draft.destination && ` → ${draft.destination.name}`}
                            </p>
                            <p className="text-3xl font-semibold break-all tabular-nums">{amount}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            isDisabled={isSubmitting}
                            onPress={() => setStep('amount')}
                          >
                            {t('AmountFlow.editAmount')}
                          </Button>
                        </div>
                        <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-4">
                          <TransactionDetailsFields
                            mode={mode}
                            onTotalsChange={() => {
                              draft.touchedTotals.current = true;
                            }}
                          />
                        </fieldset>
                      </>
                    )}
                    {saveError && (
                      <p role="alert" className="text-danger text-sm">
                        {saveError}
                      </p>
                    )}
                  </Modal.Body>
                  <Modal.Footer className="shrink-0">
                    {step === 'amount' ? (
                      <Button
                        key="continue"
                        type="button"
                        variant="primary"
                        fullWidth
                        isDisabled={!canContinue || !draft.preferences.ready}
                        onPress={draft.continueToDetails}
                      >
                        {t('AmountFlow.continue')} →
                      </Button>
                    ) : (
                      <Button key="save" type="submit" variant="primary" fullWidth isDisabled={isSubmitting}>
                        {isSubmitting && <Spinner size="sm" />}
                        {isSubmitting
                          ? t('Generics.saving')
                          : t(draft.isEditing ? 'Generics.edit' : 'AmountFlow.saveTransaction')}
                      </Button>
                    )}
                  </Modal.Footer>
                </form>
              </FormProvider>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <DiscardTransactionDialog open={discardOpen} onKeep={() => setDiscardOpen(false)} onDiscard={close} />
    </>
  );
};
