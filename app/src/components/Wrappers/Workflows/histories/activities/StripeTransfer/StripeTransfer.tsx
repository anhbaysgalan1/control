import React, { FunctionComponent } from 'react';

import { AccountTree } from '@mui/icons-material';
import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Chip } from '@numaryhq/storybook';

import NodeTitle from '~/src/components/Wrappers/Workflows/CustomNode/NodeTitle';
import { StripeTransferProps } from '~/src/components/Wrappers/Workflows/histories/activities/StripeTransfer/types';
import {
  chipContainer,
  containerSx,
  typoSx,
} from '~/src/components/Wrappers/Workflows/stages/utils';
import { useToggle } from '~/src/hooks/useToggle';

const StripeTransfer: FunctionComponent<StripeTransferProps> = ({
  asset,
  destination,
  amount,
}) => {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const [show, toggle] = useToggle(false);

  return (
    <Box
      className="react-flow__node-default"
      sx={{
        borderRadius: '15px',
        border: ({ palette }) => `1px dotted ${palette.green.bright}`,
        width: '100%',
      }}
    >
      <NodeTitle
        label={t('pages.flow.activities.stripeTransfer.title')}
        color={palette.green.light}
        onToggle={toggle}
        icon={<AccountTree />}
      />
      {show && (
        <>
          <Box component="span" display="block" sx={containerSx} mt={1}>
            <Box sx={chipContainer}>
              <Typography sx={typoSx} variant="bold">
                {t('pages.flow.activities.stripeTransfer.destination')}
              </Typography>
              <Chip label={destination} variant="square" />
            </Box>
            <Box sx={chipContainer}>
              <Typography sx={typoSx} variant="bold">
                {t('pages.flow.activities.stripeTransfer.amount')}
              </Typography>
              <Chip label={`${amount} ${asset}`} variant="square" color="red" />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default StripeTransfer;
