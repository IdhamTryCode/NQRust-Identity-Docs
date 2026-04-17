import Link from 'next/link'

const categories = [
  {
    title: 'Getting Started',
    cards: [
      { title: 'OpenJDK', desc: 'Get started with NQRust-Identity on a physical or virtual server.', href: '/en/guides/getting-started/getting-started-zip' },
      { title: 'Docker', desc: 'Get started with NQRust-Identity on Docker.', href: '/en/guides/getting-started/getting-started-docker' },
      { title: 'Podman', desc: 'Get started with NQRust-Identity on Podman.', href: '/en/guides/getting-started/getting-started-podman' },
      { title: 'Kubernetes', desc: 'Get started with NQRust-Identity on Kubernetes.', href: '/en/guides/getting-started/getting-started-kube' },
      { title: 'OpenShift', desc: 'Get started with NQRust-Identity on OpenShift.', href: '/en/guides/getting-started/getting-started-openshift' },
      { title: 'Scaling', desc: 'Scale and tune your NQRust-Identity installation.', href: '/en/guides/getting-started/getting-started-scaling-and-tuning' },
    ]
  },
  {
    title: 'Server',
    cards: [
      { title: 'Configuring NQRust-Identity', desc: 'Configure and start NQRust-Identity.', href: '/en/guides/server/configuration' },
      { title: 'Configuring for production', desc: 'Prepare NQRust-Identity for use in production.', href: '/en/guides/server/configuration-production' },
      { title: 'Bootstrapping and recovering an admin account', desc: 'Bootstrap and recover access by creating a temporary admin account.', href: '/en/guides/server/bootstrap-admin-recovery' },
      { title: 'Directory Structure', desc: 'Understand the purpose of the directories under the installation root.', href: '/en/guides/server/directory-structure' },
      { title: 'Running in a container', desc: 'Run NQRust-Identity from a container image.', href: '/en/guides/server/containers' },
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
      { title: 'Checking if rolling updates are possible', desc: 'Check if a rolling update is supported for your deployment.', href: '/en/guides/server/update-compatibility' },
      { title: 'Run as a Windows Service', desc: 'Install and run NQRust-Identity as a Windows service.', href: '/en/guides/server/windows-service' },
    ]
  },
  {
    title: 'Operator',
    cards: [
      { title: 'Operator Installation', desc: 'Install the NQRust-Identity Operator on Kubernetes and OpenShift.', href: '/en/guides/operator/installation' },
      { title: 'Basic deployment', desc: 'Install NQRust-Identity using the Operator.', href: '/en/guides/operator/basic-deployment' },
      { title: 'Automating a realm import', desc: 'Automate a realm import using the operator.', href: '/en/guides/operator/realm-import' },
      { title: 'Advanced configuration', desc: 'Tune advanced aspects of the NQRust-Identity CR.', href: '/en/guides/operator/advanced-configuration' },
      { title: 'Avoiding downtime with rolling updates', desc: 'Avoid downtime when changing themes, providers, or configurations.', href: '/en/guides/operator/rolling-updates' },
      { title: 'Using custom images', desc: 'Customize and optimize the NQRust-Identity container.', href: '/en/guides/operator/customizing-keycloak' },
    ]
  },
  {
    title: 'Observability',
    cards: [
      { title: 'Centralize with OpenTelemetry', desc: 'OpenTelemetry integration for centralized observability and telemetry data.', href: '/en/guides/observability/telemetry' },
      { title: 'Tracking instance status with health checks', desc: 'Check if an instance is ready to serve requests via health REST endpoints.', href: '/en/guides/observability/health' },
      { title: 'Gaining insights with metrics', desc: 'Collect metrics to gain insights about a running instance.', href: '/en/guides/observability/configuration-metrics' },
      { title: 'Monitoring user activities with event metrics', desc: 'Event metrics provide an aggregated view of user activities.', href: '/en/guides/observability/event-metrics' },
      { title: 'Monitoring performance with Service Level Indicators', desc: 'Track performance and reliability with SLIs and SLOs.', href: '/en/guides/observability/identity-service-level-indicators' },
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
      { title: 'Single-cluster deployments', desc: 'Deploy a single cluster, optionally across multiple availability-zones.', href: '/en/guides/high-availability/single-cluster-introduction' },
      { title: 'Multi-cluster deployments', desc: 'Connect multiple deployments in independent Kubernetes clusters.', href: '/en/guides/high-availability/multi-cluster-introduction' },
    ]
  },
  {
    title: 'UI Customization',
    cards: [
      { title: 'Introduction', desc: 'Learn how to customize the user interfaces.', href: '/en/guides/ui-customization/introduction' },
      { title: 'Working with themes', desc: 'Understand how to create and configure themes.', href: '/en/guides/ui-customization/themes' },
      { title: 'Customizing with Quick Theme', desc: 'Customize the consoles and login screens with the Quick Theme utility.', href: '/en/guides/ui-customization/quick-theme' },
      { title: 'Localization', desc: 'Learn how to localize strings in the UIs.', href: '/en/guides/ui-customization/localization' },
      { title: 'Using Avatars', desc: 'Use avatars in the Admin console and Account console.', href: '/en/guides/ui-customization/avatars' },
      { title: 'Customizing the Welcome Theme', desc: 'Learn how to customize the welcome theme.', href: '/en/guides/ui-customization/welcome-theme' },
      { title: 'Creating your own Console', desc: 'Create your own version of Admin Console or Account Console.', href: '/en/guides/ui-customization/creating-your-own-console' },
      { title: 'Using the npm UI packages', desc: 'Learn how to use UI modules in your own application.', href: '/en/guides/ui-customization/themes-react' },
    ]
  },
  {
    title: 'Migration',
    cards: [
      { title: 'Migrating to Quarkus distribution', desc: 'Migrate to the new Quarkus distribution from the legacy WildFly distribution.', href: '/en/guides/migration/migrating-to-quarkus' },
    ]
  },
]

export function GuidesCards() {
  return (
    <div className="mt-4">
      {categories.map((cat) => (
        <div key={cat.title} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">{cat.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="block rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all no-underline"
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{card.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{card.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
