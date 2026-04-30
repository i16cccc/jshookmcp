import type { DomainManifest, MCPServerContext } from '@server/domains/shared/registry';
import { defineMethodRegistrations, toolLookup } from '@server/domains/shared/registry';
import { coordinationTools } from '@server/domains/coordination/definitions';
import type { CoordinationHandlers } from '@server/domains/coordination/index';

const DOMAIN = 'coordination' as const;
const DEP_KEY = 'coordinationHandlers' as const;
type H = CoordinationHandlers;
const t = toolLookup(coordinationTools);
const registrations = defineMethodRegistrations<H, (typeof coordinationTools)[number]['name']>({
  domain: DOMAIN,
  depKey: DEP_KEY,
  lookup: t,
  entries: [
    { tool: 'create_task_handoff', method: 'handleCreateTaskHandoff' },
    { tool: 'complete_task_handoff', method: 'handleCompleteTaskHandoff' },
    { tool: 'get_task_context', method: 'handleGetTaskContext' },
    { tool: 'append_session_insight', method: 'handleAppendSessionInsight' },
    { tool: 'save_page_snapshot', method: 'handleSavePageSnapshot' },
    { tool: 'restore_page_snapshot', method: 'handleRestorePageSnapshot' },
    { tool: 'list_page_snapshots', method: 'handleListPageSnapshots' },
  ],
});

async function ensure(ctx: MCPServerContext): Promise<H> {
  const { CoordinationHandlers } = await import('@server/domains/coordination/index');
  if (!ctx.coordinationHandlers) {
    ctx.coordinationHandlers = new CoordinationHandlers(ctx);
  }
  return ctx.coordinationHandlers;
}

const manifest = {
  kind: 'domain-manifest',
  version: 1,
  domain: DOMAIN,
  depKey: DEP_KEY,
  profiles: ['full'],
  ensure,
  registrations,
} satisfies DomainManifest<typeof DEP_KEY, H, typeof DOMAIN>;

export default manifest;
