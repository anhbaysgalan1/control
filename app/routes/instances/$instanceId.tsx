import * as React from 'react';
import { useEffect } from 'react';

import { DashboardCustomize } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { MetaFunction } from '@remix-run/node';
import { Session } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';
import ReactFlow, { Controls, Edge, useNodesState } from 'reactflow';
import invariant from 'tiny-invariant';

import { Page, SectionWrapper } from '@numaryhq/storybook';

import ComponentErrorBoundary from '~/src/components/Wrappers/ComponentErrorBoundary';
import IconTitlePage from '~/src/components/Wrappers/IconTitlePage';
import CustomNode from '~/src/components/Wrappers/Workflows/CustomNode';
import { OrchestrationRunHistories } from '~/src/types/orchestration';
import { API_ORCHESTRATION } from '~/src/utils/api';
import { createApiClient } from '~/src/utils/api.server';
import { handleResponse, withSession } from '~/src/utils/auth.server';

export const meta: MetaFunction = () => ({
  title: 'Flow',
  description: 'Show a workflow instance',
});

export const loader: LoaderFunction = async ({ request, params }) => {
  async function handleData(session: Session) {
    invariant(params.instanceId, 'Expected params.instanceId');
    const api = await createApiClient(session);
    const instance = await api.getResource<any>(
      `${API_ORCHESTRATION}/instances/${params.instanceId}`,
      'data'
    );
    const instanceHistory = await api.getResource<any>(
      `${API_ORCHESTRATION}/instances/${params.instanceId}/history`,
      'data'
    );

    // There is no history for stage wait_event and delay, so we can hardcode 0 as send stage number
    const sendStageHistory =
      instance.status.length > 0
        ? await api.getResource<any>(
            `${API_ORCHESTRATION}/instances/${params.instanceId}/stages/0/history`,
            'data'
          )
        : [];

    return { ...instance, instanceHistory, sendStageHistory };
  }

  return handleResponse(await withSession(request, handleData));
};

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ComponentErrorBoundary
      id="instance"
      title="pages.instance.title"
      error={error}
      showAction={false}
    />
  );
}

const nodeTypes = { customNode: CustomNode };

export default function Index() {
  const { t } = useTranslation();
  const instance = useLoaderData(); // TODO type
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  console.log(instance);
  let x = 0;

  const instanceHistoryNodes = instance.instanceHistory.map(
    (history: any, index: number) => {
      x = x + index === 0 ? 0 : x + 200;

      return {
        type: 'customNode',
        id: `instance-history-node-${index}`,
        position: { x, y: 100 },
        data: {
          isChild: history.name !== OrchestrationRunHistories.RUN_SEND,
          label: history.name,
          details: history,
        },
      };
    }
  );

  const stageSendHistoryNodes = instance.sendStageHistory.map(
    (history: any, index: number) => {
      x = x + index === 0 ? 0 : x + 100;

      return {
        type: 'customNode',
        id: `stage-send-history-node-${index}`,
        position: { x, y: 400 },
        data: {
          isChild: true,
          label: history.name,
          details: history.output.CreateTransaction.data[0],
        },
      };
    }
  );

  const instanceHistoryEdges = instance.instanceHistory
    .map((history: any, index: number) => {
      if (index < instance.instanceHistory.length - 1) {
        return {
          id: `instance-history-edge-${index}`,
          source: `instance-history-node-${index}`,
          target: `instance-history-node-${index + 1}`,
        };
      }
    })
    .filter((edge: Edge) => edge !== undefined);

  const stageSendHistoryEdges = instance.sendStageHistory.map(
    (history: any, index: number) => ({
      id: `stage-send-history-edge-${index}`,
      source: `instance-history-node-0`,
      animated: true,
      target: `stage-send-history-node-${index}`,
    })
  );

  useEffect(() => {
    setNodes([...instanceHistoryNodes, ...stageSendHistoryNodes]);
  }, []);
  const edges = [...stageSendHistoryEdges, ...instanceHistoryEdges];

  return (
    <Page
      id="instance"
      title={
        <IconTitlePage
          icon={<DashboardCustomize />}
          title={t('pages.instance.title')}
        />
      }
    >
      <>
        <SectionWrapper title={t('pages.instance.sections.details.title')}>
          <Box sx={{ width: '96%', height: '400px', mb: 10 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              onNodesChange={onNodesChange}
              elementsSelectable={false}
              nodesConnectable={false}
              preventScrolling
              nodeTypes={nodeTypes}
            >
              <Controls showInteractive={false} />
            </ReactFlow>
          </Box>
        </SectionWrapper>
      </>
    </Page>
  );
}
