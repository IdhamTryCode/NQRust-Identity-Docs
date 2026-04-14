import Link from 'next/link'

const categories = [
  {
    title: 'Installation',
    cards: [
      { title: 'Installation Overview', desc: 'Prerequisites and airgapped installer setup.', href: '/en/guides/installation' },
      { title: 'Phase 1: Install Identity', desc: 'Configure hostname, ports, and deploy Identity + Portal containers.', href: '/en/guides/installation/phase-1-identity' },
      { title: 'Phase 2: Configure Portal', desc: 'Create OAuth client, realm role, user, and link the Portal.', href: '/en/guides/installation/phase-2-portal' },
    ]
  },
  {
    title: 'Server',
    cards: [
      { title: 'Configuring NQRust-Identity', desc: 'Configure and start NQRust-Identity.', href: '/en/guides/server/configuration' },
      { title: 'Configuring for production', desc: 'Prepare NQRust-Identity for use in production.', href: '/en/guides/server/configuration-production' },
      { title: 'Bootstrapping and recovering an admin account', desc: 'Bootstrap and recover access by creating a temporary admin account.', href: '/en/guides/server/bootstrap-admin-recovery' },
      { title: 'Directory Structure', desc: 'Understand the purpose of directories under the installation root.', href: '/en/guides/server/directory-structure' },
      { title: 'Configuring TLS', desc: 'Configure https certificates for ingoing and outgoing requests.', href: '/en/guides/server/enabletls' },
      { title: 'Configuring the hostname', desc: 'Configure the frontend and backchannel endpoints.', href: '/en/guides/server/hostname' },
      { title: 'Configuring a reverse proxy', desc: 'Configure with a reverse proxy, API gateway, or load balancer.', href: '/en/guides/server/reverseproxy' },
      { title: 'Configuring the database', desc: 'Configure a relational database to store user, client, and realm data.', href: '/en/guides/server/db' },
      { title: 'Configuring distributed caches', desc: 'Configure the caching layer to cluster multiple instances.', href: '/en/guides/server/caching' },
      { title: 'Configuring outgoing HTTP requests', desc: 'Configure the client used for outgoing HTTP requests.', href: '/en/guides/server/outgoinghttp' },
      { title: 'Configuring trusted certificates', desc: 'Configure the Truststore to communicate through TLS.', href: '/en/guides/server/keycloak-truststore' },
      { title: 'Configuring trusted certificates for mTLS', desc: 'Configure Mutual TLS to verify connecting clients.', href: '/en/guides/server/mutual-tls' },
      { title: 'Enabling and disabling features', desc: 'Configure NQRust-Identity to use optional features.', href: '/en/guides/server/features' },
      { title: 'Configuring providers', desc: 'Configure providers for NQRust-Identity.', href: '/en/guides/server/configuration-provider' },
      { title: 'Configuring logging', desc: 'Configure logging for NQRust-Identity.', href: '/en/guides/server/logging' },
      { title: 'FIPS 140-2 support', desc: 'Configure the server for FIPS compliance.', href: '/en/guides/server/fips' },
      { title: 'Configuring the Management Interface', desc: 'Configure the management interface for metrics and health checks.', href: '/en/guides/server/management-interface' },
      { title: 'Importing and exporting realms', desc: 'Import and export realms as JSON files.', href: '/en/guides/server/importexport' },
      { title: 'Using a vault', desc: 'Configure and use a vault in NQRust-Identity.', href: '/en/guides/server/vault' },
      { title: 'All configuration', desc: 'Review build options and configuration.', href: '/en/guides/server/all-config' },
      { title: 'All provider configuration', desc: 'Review provider configuration options.', href: '/en/guides/server/all-provider-config' },
    ]
  },
  {
    title: 'Observability',
    cards: [
      { title: 'Centralize with OpenTelemetry', desc: 'OpenTelemetry integration for centralized observability and telemetry data.', href: '/en/guides/observability/telemetry' },
      { title: 'Tracking instance status with health checks', desc: 'Check if an instance is ready to serve requests via health REST endpoints.', href: '/en/guides/observability/health' },
      { title: 'Gaining insights with metrics', desc: 'Collect metrics to gain insights about a running instance.', href: '/en/guides/observability/configuration-metrics' },
      { title: 'Monitoring user activities with event metrics', desc: 'Event metrics provide an aggregated view of user activities.', href: '/en/guides/observability/event-metrics' },
      { title: 'Monitoring performance with Service Level Indicators', desc: 'Track performance and reliability with SLIs and SLOs.', href: '/en/guides/observability/keycloak-service-level-indicators' },
      { title: 'Troubleshooting using metrics', desc: 'Use metrics for troubleshooting errors and performance issues.', href: '/en/guides/observability/metrics-for-troubleshooting' },
      { title: 'Root cause analysis with tracing', desc: 'Record request lifecycle information to identify root causes for latencies.', href: '/en/guides/observability/tracing' },
      { title: 'Visualizing activities in dashboards', desc: 'Install Grafana dashboards to visualize metrics and activities.', href: '/en/guides/observability/grafana-dashboards' },
      { title: 'Analyzing outliers and errors with exemplars', desc: 'Connect a metric to a recorded trace to analyze root causes.', href: '/en/guides/observability/exemplars' },
    ]
  },
  {
    title: 'Securing Applications',
    cards: [
      { title: 'Planning for securing applications', desc: 'Understand basic concepts for securing applications and services.', href: '/en/guides/securing-apps/overview' },
      { title: 'Securing apps with OpenID Connect', desc: 'Use OpenID Connect with NQRust-Identity to secure applications.', href: '/en/guides/securing-apps/oidc-layers' },
      { title: 'JavaScript adapter', desc: 'Client-side JavaScript library to secure web applications.', href: '/en/guides/securing-apps/javascript-adapter' },
      { title: 'Node.js adapter', desc: 'Node.js adapter to protect server-side JavaScript apps.', href: '/en/guides/securing-apps/nodejs-adapter' },
      { title: 'Configuring mod_auth_openidc', desc: 'Configure the mod_auth_openidc Apache module.', href: '/en/guides/securing-apps/mod-auth-openidc' },
      { title: 'SAML Galleon feature pack', desc: 'Use SAML Galleon feature pack to secure WildFly and EAP applications.', href: '/en/guides/securing-apps/saml-galleon-layers' },
      { title: 'Configuring mod_auth_mellon', desc: 'Configure the mod_auth_mellon Apache module.', href: '/en/guides/securing-apps/mod-auth-mellon' },
      { title: 'Configuring a Docker registry', desc: 'Configure a Docker registry to use NQRust-Identity.', href: '/en/guides/securing-apps/docker-registry' },
      { title: 'Using the client registration service', desc: 'Use the client registration service.', href: '/en/guides/securing-apps/client-registration' },
      { title: 'Automating client registration with the CLI', desc: 'Use the CLI to automate client registration.', href: '/en/guides/securing-apps/client-registration-cli' },
      { title: 'Integrating with MCP', desc: 'Use NQRust-Identity as an authorization server for MCP servers.', href: '/en/guides/securing-apps/mcp-authz-server' },
      { title: 'Configuring token exchange', desc: 'Configure and use token exchange.', href: '/en/guides/securing-apps/token-exchange' },
      { title: 'JWT Authorization Grant', desc: 'Guide for the JWT Authorization Grant specification RFC 7521 / 7523.', href: '/en/guides/securing-apps/jwt-authorization-grant' },
      { title: 'Specifications implemented', desc: 'List of specifications and standards implemented.', href: '/en/guides/securing-apps/specifications' },
      { title: 'Admin client', desc: 'Using the admin client to access the Admin REST API.', href: '/en/guides/securing-apps/admin-client' },
      { title: 'Authorization client', desc: 'Using the authz client to administer and check permissions.', href: '/en/guides/securing-apps/authz-client' },
      { title: 'Policy enforcer', desc: 'Using the policy enforcer in Java applications.', href: '/en/guides/securing-apps/policy-enforcer' },
      { title: 'Upgrading the Client Libraries', desc: 'How to upgrade the NQRust-Identity Client Libraries.', href: '/en/guides/securing-apps/upgrading' },
    ]
  },
  {
    title: 'High Availability',
    cards: [
      { title: 'High availability overview', desc: 'Explore the different NQRust-Identity high-availability architectures.', href: '/en/guides/high-availability/introduction' },
    ]
  },
]

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} style={{
      display: 'block',
      textDecoration: 'none',
      border: '1px solid var(--nextra-border-color, #e5e7eb)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
      ;(e.currentTarget as HTMLElement).style.borderColor = '#f36523'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = 'none'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--nextra-border-color, #e5e7eb)'
    }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>{desc}</div>
    </Link>
  )
}

export function GuidesHomePage() {
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          background: 'rgba(243,101,35,0.1)',
          color: '#f36523',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginBottom: '1rem',
        }}>
          Identity Management, Simplified
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          NQRust-Identity Guides
        </h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.6, maxWidth: '36rem', margin: '0 auto' }}>
          Step-by-step guides to configure, deploy, and secure your NQRust-Identity instance.
        </p>
      </div>

      {/* Categories */}
      {categories.map((cat) => (
        <section key={cat.title} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
              {cat.title}
            </h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--nextra-border-color, #e5e7eb)' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }}>
            {cat.cards.map((card) => (
              <Card key={card.href} {...card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
