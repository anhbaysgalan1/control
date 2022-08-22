import { flatten, get, head, omit } from 'lodash';
import React, { FunctionComponent } from 'react';
import { TransactionListProps } from './types';
import { Transaction, TransactionHybrid } from '~/src/types/ledger';
import { Cursor } from '~/src/types/generic';
import {
  getLedgerAccountDetailsRoute,
  getLedgerTransactionDetailsRoute,
} from '~/src/components/Navbar/routes';
import { useNavigate } from 'react-router-dom';
import {
  Amount,
  Date,
  LoadingButton,
  Row,
  SourceDestination,
  Txid,
} from '@numaryhq/storybook';
import { ArrowRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Table from '~/src/components/Wrappers/Table';
import { Box } from '@mui/material';

const normalize = (cursor: Cursor<Transaction>): Cursor<Transaction> =>
  ({
    ...cursor,
    data: flatten(
      get(cursor, 'data', []).map((transaction: Transaction) =>
        get(transaction, 'postings', []).map((posting, index) => ({
          ...posting,
          postingId: index,
          ...omit(transaction, 'postings'),
        }))
      )
    ),
  } as unknown as Cursor<Transaction>);

const TransactionList: FunctionComponent<TransactionListProps> = ({
  transactions,
  withPagination,
  paginationSize = 15,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const transactionsNormalized = normalize(transactions);

  const handleAction = (transaction: TransactionHybrid) =>
    navigate(
      getLedgerTransactionDetailsRoute(transaction.txid, transaction.ledger)
    );

  const handleSourceDestinationAction = (id: string, ledger: string) => {
    navigate(getLedgerAccountDetailsRoute(id, ledger));
  };

  const renderRowActions = (transaction: TransactionHybrid) => (
    <Box key={transaction.txid} component="span">
      <LoadingButton
        id={`show-${transaction.txid}`}
        onClick={() => handleAction(transaction)}
        endIcon={<ArrowRight />}
      />
    </Box>
  );

  return (
    <>
      <Table
        withPagination={withPagination}
        paginationSize={paginationSize}
        items={transactionsNormalized}
        action={true}
        columns={[
          {
            key: 'txid',
            label: t('pages.transactions.table.columnLabel.txid'),
          },
          {
            key: 'value',
            label: t('pages.transactions.table.columnLabel.value'),
          },
          {
            key: 'source',
            label: t('pages.transactions.table.columnLabel.source'),
          },
          {
            key: 'destination',
            label: t('pages.transactions.table.columnLabel.destination'),
          },
          {
            key: 'date',
            label: t('pages.transactions.table.columnLabel.date'),
          },
        ]}
        renderItem={(
          transaction: TransactionHybrid,
          index: number,
          data: TransactionHybrid[]
        ) => {
          const groupedByTxid = data.filter(
            (a: TransactionHybrid) => a.txid === transaction.txid
          );
          const first = head(groupedByTxid) as TransactionHybrid;
          const displayElement =
            first.destination === transaction.destination &&
            first.source === transaction.source &&
            first.txid === transaction.txid;

          return (
            <Row
              key={index}
              keys={[
                displayElement ? (
                  <Txid id={transaction.txid} key={transaction.txid} />
                ) : (
                  <></>
                ),
                <Amount
                  asset={transaction.asset}
                  key={transaction.txid}
                  amount={transaction.amount}
                />,
                <SourceDestination
                  key={transaction.txid}
                  label={transaction.source}
                  color="blue"
                  onClick={() =>
                    handleSourceDestinationAction(
                      transaction.source,
                      transaction.ledger
                    )
                  }
                />,
                <SourceDestination
                  key={transaction.txid}
                  label={transaction.destination}
                  color="blue"
                  onClick={() =>
                    handleSourceDestinationAction(
                      transaction.destination,
                      transaction.ledger
                    )
                  }
                />,
                <Date
                  key={transaction.txid}
                  timestamp={transaction.timestamp}
                />,
              ]}
              item={transaction}
              renderActions={() => renderRowActions(transaction)}
            />
          );
        }}
      />
    </>
  );
};

export default TransactionList;