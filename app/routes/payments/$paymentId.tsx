import type { ReactElement } from 'react';
import * as React from 'react';

import ContentCopy from '@mui/icons-material/ContentCopy';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Divider, Grid, Tooltip, Typography } from '@mui/material';
import type { MetaFunction, Session } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

import {
  Amount,
  Chip,
  Date,
  DividerWithSpace,
  JsonViewer,
  LoadingButton,
  Page,
  Row,
  SectionWrapper,
  theme,
} from '@numaryhq/storybook';

import ComponentErrorBoundary from '~/src/components/Wrappers/ComponentErrorBoundary';
import TransactionList from '~/src/components/Wrappers/Lists/TransactionList';
import PayInChips from '~/src/components/Wrappers/PayInChips';
import PaymentStatusChip from '~/src/components/Wrappers/PaymentStatusChip';
import ProviderPicture from '~/src/components/Wrappers/ProviderPicture';
import Table from '~/src/components/Wrappers/Table';
import { Cursor } from '~/src/types/generic';
import { Transaction } from '~/src/types/ledger';
import { AdjustmentsItem, PaymentDetail } from '~/src/types/payment';
import { RECO_DEFAULT_LEDGER, RECO_METADATA_PATH_KEY } from '~/src/types/reco';
import { API_LEDGER, API_PAYMENT } from '~/src/utils/api';
import { createApiClient } from '~/src/utils/api.server';
import { handleResponse, withSession } from '~/src/utils/auth.server';
import { copyTokenToClipboard } from '~/src/utils/clipboard';
import { lowerCaseAllWordsExceptFirstLetter } from '~/src/utils/format';

export const meta: MetaFunction = () => ({
  title: 'Payment',
  description: 'Show a payment',
});

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ComponentErrorBoundary
      id="payment"
      title="pages.payment.title"
      error={error}
      showAction={false}
    />
  );
}

export const loader: LoaderFunction = async ({ params, request }) => {
  async function handleData(session: Session) {
    invariant(params.paymentId, 'Expected params.paymentId');
    const api = await createApiClient(session);
    const payment = await api.getResource<PaymentDetail>(
      `${API_PAYMENT}/payments/${params.paymentId}`,
      'data'
    );
    const transactions = await api.getResource<PaymentDetail>(
      `${API_LEDGER}/${RECO_DEFAULT_LEDGER}/transactions?metadata[${RECO_METADATA_PATH_KEY}]=${params.paymentId}`,
      'cursor'
    );

    return {
      payment,
      transactions,
    };
  }

  return handleResponse(await withSession(request, handleData));
};

const boxWithCopyToClipboard = (
  title: string,
  id: string,
  color: string,
  tooltipTitle: string
) => {
  const [open, setOpen] = React.useState(false);
  const copyToClipBoard = async () => {
    handleOpen();
    await copyTokenToClipboard(id);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: '15px',
        borderRadius: '6px',
        justifyContent: 'space-between',
        backgroundColor: color,
      }}
    >
      <Typography variant="bold">{title}</Typography>
      <Tooltip title={id}>
        <Typography noWrap sx={{ maxWidth: '250px' }}>
          {id}
        </Typography>
      </Tooltip>
      <Tooltip open={open} onClose={handleClose} title={tooltipTitle}>
        <Box component="span">
          <LoadingButton
            id="copyToClipboardWrapper"
            variant="transparent"
            sx={{
              minWidth: 0,
              height: 0,
              p: 0,
            }}
            startIcon={<ContentCopy color="action" onClick={copyToClipBoard} />}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};

const eventsJournalItem = (eventTitle: string, date: string) => (
  <Box
    sx={{
      display: 'flex',
      width: '100%',
      padding: '5px 0 5px 0',
      justifyContent: 'space-between',
    }}
  >
    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
      <StopIcon sx={{ color: theme.palette.grey[500] }} />
      {eventTitle}
    </Typography>
    <Typography
      variant="footNote"
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <Divider sx={{ width: '200px', marginRight: '20px' }} />
      <Date timestamp={date} format="M/D/YYYY" />
    </Typography>
  </Box>
);

const dataItem = (title: string, children: ReactElement) => (
  <Box
    sx={{
      display: 'flex',
      padding: '5px 0 5px 0',
      minHeight: '30px',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Typography variant="bold">{title}:</Typography>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '300px',
        justifyContent: 'flex-start',
      }}
    >
      <Typography
        variant="footNote"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {children}
      </Typography>
    </Box>
  </Box>
);

const titleHeader = (title: string, date: Date) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
    }}
  >
    <Typography variant="h1" pr={1}>
      {title}
    </Typography>
    <Date
      timestamp={date}
      format="M/D/YYYY"
      color={theme.palette.neutral[600]}
    />
  </Box>
);

interface PaymentDetailData {
  payment: PaymentDetail;
  transactions: Cursor<Transaction>;
}

export default function PaymentDetails() {
  const { payment, transactions } =
    useLoaderData<PaymentDetailData>() as unknown as PaymentDetailData;
  const { t } = useTranslation();
  const Divider = <DividerWithSpace pt="24px" mb="0px" />;

  return (
    <Page
      id="payment"
      title={titleHeader(t('pages.payment.title'), payment.createdAt)}
    >
      <>
        <Grid container spacing="26px" sx={{ mt: 0 }}>
          <Grid item xs={6}>
            {boxWithCopyToClipboard(
              t('pages.payment.id'),
              payment.id,
              theme.palette.blue.light,
              t('pages.payment.copyToClipboardTooltip', {
                value: 'id',
              })
            )}
          </Grid>
          <Grid item xs={6}>
            {boxWithCopyToClipboard(
              t('pages.payment.reference'),
              payment.reference,
              theme.palette.violet.light,
              t('pages.payment.copyToClipboardTooltip', {
                value: 'reference',
              })
            )}
          </Grid>
        </Grid>
        {Divider}

        {/* Description2 */}
        <Grid container spacing="26px">
          <Grid item xs={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                p: '15px',
              }}
            >
              {dataItem(
                t('pages.payment.type'),
                <PayInChips type={payment.type} />
              )}
              {dataItem(
                t('pages.payment.processor'),
                <ProviderPicture provider={payment.provider} />

              )}
              {dataItem(
                t('pages.payment.status'),
                <PaymentStatusChip status={payment.status} />
              )}
              {dataItem(
                t('pages.payment.scheme'),
                <Chip  label={lowerCaseAllWordsExceptFirstLetter(payment.scheme)} variant="square" />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: '15px',
              }}
            >
              {dataItem(
                t('pages.payment.netValue'),
                <Amount amount={payment.initialAmount} asset={payment.asset} />
              )}
              {dataItem(
                t('pages.payment.initialAmount'),
                <Amount amount={payment.initialAmount} asset={payment.asset} />
              )}
            </Box>
          </Grid>
        </Grid>

        {Divider}

        {/* Events journals */}
        {payment.adjustments.length > 0 && (
          <><SectionWrapper title={t('pages.payment.eventJournal.title')}>
          <>
            {payment.adjustments.map(
              (adjustments: AdjustmentsItem, index: number) => (
                <div key={index}>
                  {eventsJournalItem(
                    t('pages.payment.eventJournal.netValueChange', {
                      value1: payment.status,
                      value2: adjustments.status,
                    }),
                    adjustments.date
                  )}
                  {eventsJournalItem(
                    t('pages.payment.eventJournal.statusChange', {
                      value1: payment.initialAmount,
                      value2: adjustments.amount,
                    }),
                    adjustments.date
                  )}
                </div>
              )
            )}
          </>
        </SectionWrapper>
        {Divider}</>
        )}

        {/* Reconciliation*/}
        {transactions.data.length > 0 && (
          <><SectionWrapper title={t('pages.payment.reconciliation.title')}>
          <TransactionList
            transactions={transactions}
            withPagination={false}

          />
        </SectionWrapper>
        {Divider}</>
        )}

        {/* Metadata */}
        {/* TODO replace this when Metadata is done */}
        <SectionWrapper title={t('pages.payment.metadata')}>
          <Table
            id="metadata"
            withPagination={false}
            key={payment.id}
            withHeader={false}
            items={[]}
            columns={[]}
            renderItem={(item: any) =>
              <Row item={item} keys={[]} />}
            />

        </SectionWrapper>
        {Divider}
        {/* Raw object */}
        <SectionWrapper title={t('pages.payment.rawObject')}>
          <JsonViewer jsonData={payment.raw} />
        </SectionWrapper>
      </>
    </Page>
  );
}
