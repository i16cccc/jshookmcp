import type { DomainManifest, MCPServerContext } from '@server/domains/shared/registry';
import { defineMethodRegistrations, toolLookup } from '@server/domains/shared/registry';
import { PROXY_TOOLS } from '@server/domains/proxy/definitions';
import type { ProxyHandlers } from '@server/domains/proxy/index';

const DOMAIN = 'proxy' as const;
const DEP_KEY = 'proxyHandlers' as const;
type H = ProxyHandlers;
const t = toolLookup(PROXY_TOOLS);
const registrations = defineMethodRegistrations<H, (typeof PROXY_TOOLS)[number]['name']>({
  domain: DOMAIN,
  depKey: DEP_KEY,
  lookup: t,
  entries: [
    { tool: 'proxy_start', method: 'handleProxyStart' },
    { tool: 'proxy_stop', method: 'handleProxyStop' },
    { tool: 'proxy_status', method: 'handleProxyStatus' },
    { tool: 'proxy_export_ca', method: 'handleProxyExportCa' },
    { tool: 'proxy_add_rule', method: 'handleProxyAddRule' },
    { tool: 'proxy_get_requests', method: 'handleProxyGetRequests' },
    { tool: 'proxy_clear_logs', method: 'handleProxyClearLogs' },
    { tool: 'proxy_setup_adb_device', method: 'handleProxySetupAdbDevice' },
  ],
});

async function ensure(ctx: MCPServerContext): Promise<H> {
  const { ProxyHandlers } = await import('@server/domains/proxy/index');
  if (!ctx.proxyHandlers) {
    ctx.proxyHandlers = new ProxyHandlers();
  }
  return ctx.proxyHandlers;
}

const manifest: DomainManifest<typeof DEP_KEY, H, typeof DOMAIN> = {
  kind: 'domain-manifest',
  version: 1,
  domain: DOMAIN,
  depKey: DEP_KEY,
  profiles: ['full'],
  ensure,
  registrations,
};

export default manifest;
