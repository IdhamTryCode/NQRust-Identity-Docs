// Shared category data for the landing homepage and per-category index pages.
// Each card has English (title/desc) and optional Indonesian (titleId/descId)
// variants — components pick based on locale, fallback to English.

export interface Card {
  title: string
  desc: string
  titleId?: string
  descId?: string
  slug: string // path segment under /{locale}/guides/{category}/
  hidden?: boolean // if true, omitted from landing cards and category index pages (page still accessible by URL)
}

export interface Category {
  key: string   // folder name under pages/{locale}/guides/
  title: string
  titleId?: string
  cards: Card[]
}

export const CATEGORIES: Category[] = [
  {
    key: 'installation',
    title: 'Installation',
    titleId: 'Instalasi',
    cards: [
      { title: 'Installation Overview', desc: 'Prerequisites and airgapped installer setup.', titleId: 'Ikhtisar Instalasi', descId: 'Prasyarat dan setup installer airgapped.', slug: '' },
      { title: 'Phase 1: Install Identity', desc: 'Configure hostname, ports, and deploy Identity + Portal containers.', titleId: 'Fase 1: Instalasi Identity', descId: 'Konfigurasi hostname, port, dan deploy container Identity + Portal.', slug: 'phase-1-identity' },
      { title: 'Phase 2: Configure Portal', desc: 'Create OAuth client, realm role, user, and link the Portal.', titleId: 'Fase 2: Konfigurasi Portal', descId: 'Membuat OAuth client, realm role, user, dan menghubungkan Portal.', slug: 'phase-2-portal' },
      { title: 'Add a new client', desc: 'Register an additional OAuth client (e.g. NQRust Analytics) and assign it to users.', titleId: 'Tambah client baru', descId: 'Mendaftarkan OAuth client tambahan (misal NQRust Analytics) dan meng-assign-nya ke user.', slug: 'add-new-client' },
    ],
  },
  {
    key: 'server',
    title: 'Server',
    titleId: 'Server',
    cards: [
      { title: 'Configuring NQRust-Identity', desc: 'Configure and start NQRust-Identity.', titleId: 'Mengonfigurasi NQRust-Identity', descId: 'Mengonfigurasi dan menjalankan NQRust-Identity.', slug: 'configuration' },
      { title: 'Configuring for production', desc: 'Prepare NQRust-Identity for use in production.', titleId: 'Mengonfigurasi untuk produksi', descId: 'Menyiapkan NQRust-Identity untuk digunakan di produksi.', slug: 'configuration-production' },
      { title: 'Bootstrapping and recovering an admin account', desc: 'Bootstrap and recover access by creating a temporary admin account.', titleId: 'Bootstrap dan pemulihan akun admin', descId: 'Bootstrap dan pemulihan akses dengan membuat akun admin sementara.', slug: 'bootstrap-admin-recovery' },
      { title: 'Directory Structure', desc: 'Understand the purpose of directories under the installation root.', titleId: 'Struktur Direktori', descId: 'Memahami tujuan setiap direktori di bawah root instalasi.', slug: 'directory-structure' },
      { title: 'Configuring TLS', desc: 'Configure https certificates for ingoing and outgoing requests.', titleId: 'Mengonfigurasi TLS', descId: 'Mengonfigurasi sertifikat https untuk request masuk dan keluar.', slug: 'enabletls' },
      { title: 'Configuring the hostname', desc: 'Configure the frontend and backchannel endpoints.', titleId: 'Mengonfigurasi hostname', descId: 'Mengonfigurasi endpoint frontend dan backchannel.', slug: 'hostname' },
      { title: 'Configuring a reverse proxy', desc: 'Configure with a reverse proxy, API gateway, or load balancer.', titleId: 'Mengonfigurasi reverse proxy', descId: 'Mengonfigurasi dengan reverse proxy, API gateway, atau load balancer.', slug: 'reverseproxy' },
      { title: 'Configuring the database', desc: 'Configure a relational database to store user, client, and realm data.', titleId: 'Mengonfigurasi database', descId: 'Mengonfigurasi database relasional untuk menyimpan data user, client, dan realm.', slug: 'db' },
      { title: 'Configuring distributed caches', desc: 'Configure the caching layer to cluster multiple instances.', titleId: 'Mengonfigurasi cache terdistribusi', descId: 'Mengonfigurasi caching layer untuk meng-cluster banyak instance.', slug: 'caching' },
      { title: 'Configuring outgoing HTTP requests', desc: 'Configure the client used for outgoing HTTP requests.', titleId: 'Mengonfigurasi outgoing HTTP requests', descId: 'Mengonfigurasi client yang digunakan untuk outgoing HTTP requests.', slug: 'outgoinghttp' },
      { title: 'Configuring trusted certificates', desc: 'Configure the Truststore to communicate through TLS.', titleId: 'Mengonfigurasi sertifikat tepercaya', descId: 'Mengonfigurasi Truststore untuk berkomunikasi melalui TLS.', slug: 'identity-truststore' },
      { title: 'Configuring trusted certificates for mTLS', desc: 'Configure Mutual TLS to verify connecting clients.', titleId: 'Mengonfigurasi sertifikat tepercaya untuk mTLS', descId: 'Mengonfigurasi Mutual TLS untuk verifikasi client yang terhubung.', slug: 'mutual-tls' },
      { title: 'Enabling and disabling features', desc: 'Configure NQRust-Identity to use optional features.', titleId: 'Mengaktifkan dan menonaktifkan fitur', descId: 'Mengonfigurasi NQRust-Identity untuk menggunakan fitur opsional.', slug: 'features' },
      { title: 'Configuring providers', desc: 'Configure providers for NQRust-Identity.', titleId: 'Mengonfigurasi provider', descId: 'Mengonfigurasi provider untuk NQRust-Identity.', slug: 'configuration-provider' },
      { title: 'Configuring logging', desc: 'Configure logging for NQRust-Identity.', titleId: 'Mengonfigurasi logging', descId: 'Mengonfigurasi logging untuk NQRust-Identity.', slug: 'logging' },
      { title: 'FIPS 140-2 support', desc: 'Configure the server for FIPS compliance.', titleId: 'Dukungan FIPS 140-2', descId: 'Mengonfigurasi server untuk compliance FIPS.', slug: 'fips', hidden: true },
      { title: 'Configuring the Management Interface', desc: 'Configure the management interface for metrics and health checks.', titleId: 'Mengonfigurasi Management Interface', descId: 'Mengonfigurasi management interface untuk metrics dan health check.', slug: 'management-interface' },
      { title: 'Importing and exporting realms', desc: 'Import and export realms as JSON files.', titleId: 'Mengimpor dan mengekspor realm', descId: 'Mengimpor dan mengekspor realm sebagai file JSON.', slug: 'importexport' },
      { title: 'Using a vault', desc: 'Configure and use a vault in NQRust-Identity.', titleId: 'Menggunakan vault', descId: 'Mengonfigurasi dan menggunakan vault di NQRust-Identity.', slug: 'vault' },
      { title: 'All configuration', desc: 'Review build options and configuration.', titleId: 'Semua konfigurasi', descId: 'Tinjauan opsi build dan konfigurasi.', slug: 'all-config' },
      { title: 'All provider configuration', desc: 'Review provider configuration options.', titleId: 'Semua konfigurasi provider', descId: 'Tinjauan opsi konfigurasi provider.', slug: 'all-provider-config' },
    ],
  },
  {
    key: 'observability',
    title: 'Observability',
    titleId: 'Observability',
    cards: [
      { title: 'Centralize with OpenTelemetry', desc: 'OpenTelemetry integration for centralized observability and telemetry data.', titleId: 'Sentralisasi dengan OpenTelemetry', descId: 'Integrasi OpenTelemetry untuk sentralisasi data observability dan telemetry.', slug: 'telemetry' },
      { title: 'Tracking instance status with health checks', desc: 'Check if an instance is ready to serve requests via health REST endpoints.', titleId: 'Melacak status instance dengan health check', descId: 'Memeriksa apakah instance siap melayani request melalui endpoint REST health.', slug: 'health' },
      { title: 'Gaining insights with metrics', desc: 'Collect metrics to gain insights about a running instance.', titleId: 'Mendapatkan insight dengan metrics', descId: 'Mengumpulkan metrics untuk mendapatkan insight tentang instance yang berjalan.', slug: 'configuration-metrics' },
      { title: 'Monitoring user activities with event metrics', desc: 'Event metrics provide an aggregated view of user activities.', titleId: 'Memantau aktivitas pengguna dengan event metrics', descId: 'Event metrics memberikan tampilan agregat dari aktivitas pengguna.', slug: 'event-metrics' },
      { title: 'Monitoring performance with Service Level Indicators', desc: 'Track performance and reliability with SLIs and SLOs.', titleId: 'Memantau performa dengan Service Level Indicators', descId: 'Melacak performa dan reliability dengan SLI dan SLO.', slug: 'identity-service-level-indicators' },
      { title: 'Troubleshooting using metrics', desc: 'Use metrics for troubleshooting errors and performance issues.', titleId: 'Troubleshooting menggunakan metrics', descId: 'Menggunakan metrics untuk troubleshooting error dan masalah performa.', slug: 'metrics-for-troubleshooting' },
      { title: 'Root cause analysis with tracing', desc: 'Record request lifecycle information to identify root causes for latencies.', titleId: 'Analisis root cause dengan tracing', descId: 'Merekam informasi lifecycle request untuk mengidentifikasi root cause latency.', slug: 'tracing' },
      { title: 'Visualizing activities in dashboards', desc: 'Install Grafana dashboards to visualize metrics and activities.', titleId: 'Memvisualisasikan aktivitas di dashboard', descId: 'Memasang dashboard Grafana untuk memvisualisasikan metrics dan aktivitas.', slug: 'grafana-dashboards' },
      { title: 'Analyzing outliers and errors with exemplars', desc: 'Connect a metric to a recorded trace to analyze root causes.', titleId: 'Menganalisis outlier dan error dengan exemplars', descId: 'Menghubungkan metric ke trace yang direkam untuk menganalisis root cause.', slug: 'exemplars' },
    ],
  },
  {
    key: 'securing-apps',
    title: 'Securing Applications',
    titleId: 'Keamanan Aplikasi',
    cards: [
      { title: 'Planning for securing applications', desc: 'Understand basic concepts for securing applications and services.', titleId: 'Perencanaan keamanan aplikasi', descId: 'Memahami konsep dasar untuk mengamankan aplikasi dan service.', slug: 'overview' },
      { title: 'Securing apps with OpenID Connect', desc: 'Use OpenID Connect with NQRust-Identity to secure applications.', titleId: 'Mengamankan aplikasi dengan OpenID Connect', descId: 'Menggunakan OpenID Connect dengan NQRust-Identity untuk mengamankan aplikasi.', slug: 'oidc-layers' },
      { title: 'JavaScript adapter', desc: 'Client-side JavaScript library to secure web applications.', titleId: 'JavaScript adapter', descId: 'Library JavaScript client-side untuk mengamankan aplikasi web.', slug: 'javascript-adapter' },
      { title: 'Node.js adapter', desc: 'Node.js adapter to protect server-side JavaScript apps.', titleId: 'Node.js adapter', descId: 'Adapter Node.js untuk melindungi aplikasi JavaScript server-side.', slug: 'nodejs-adapter' },
      { title: 'Configuring mod_auth_openidc', desc: 'Configure the mod_auth_openidc Apache module.', titleId: 'Mengonfigurasi mod_auth_openidc', descId: 'Mengonfigurasi modul Apache mod_auth_openidc.', slug: 'mod-auth-openidc', hidden: true },
      { title: 'SAML Galleon feature pack', desc: 'Use SAML Galleon feature pack to secure WildFly and EAP applications.', titleId: 'SAML Galleon feature pack', descId: 'Menggunakan SAML Galleon feature pack untuk mengamankan aplikasi WildFly dan EAP.', slug: 'saml-galleon-layers', hidden: true },
      { title: 'Configuring mod_auth_mellon', desc: 'Configure the mod_auth_mellon Apache module.', titleId: 'Mengonfigurasi mod_auth_mellon', descId: 'Mengonfigurasi modul Apache mod_auth_mellon.', slug: 'mod-auth-mellon', hidden: true },
      { title: 'Configuring a Docker registry', desc: 'Configure a Docker registry to use NQRust-Identity.', titleId: 'Mengonfigurasi Docker registry', descId: 'Mengonfigurasi Docker registry untuk menggunakan NQRust-Identity.', slug: 'docker-registry' },
      { title: 'Using the client registration service', desc: 'Use the client registration service.', titleId: 'Menggunakan client registration service', descId: 'Menggunakan client registration service.', slug: 'client-registration' },
      { title: 'Automating client registration with the CLI', desc: 'Use the CLI to automate client registration.', titleId: 'Otomatisasi client registration dengan CLI', descId: 'Menggunakan CLI untuk otomatisasi client registration.', slug: 'client-registration-cli' },
      { title: 'Integrating with MCP', desc: 'Use NQRust-Identity as an authorization server for MCP servers.', titleId: 'Integrasi dengan MCP', descId: 'Menggunakan NQRust-Identity sebagai authorization server untuk MCP server.', slug: 'mcp-authz-server', hidden: true },
      { title: 'Configuring token exchange', desc: 'Configure and use token exchange.', titleId: 'Mengonfigurasi token exchange', descId: 'Mengonfigurasi dan menggunakan token exchange.', slug: 'token-exchange', hidden: true },
      { title: 'JWT Authorization Grant', desc: 'Guide for the JWT Authorization Grant specification RFC 7521 / 7523.', titleId: 'JWT Authorization Grant', descId: 'Panduan untuk spesifikasi JWT Authorization Grant RFC 7521 / 7523.', slug: 'jwt-authorization-grant', hidden: true },
      { title: 'Specifications implemented', desc: 'List of specifications and standards implemented.', titleId: 'Spesifikasi yang diimplementasikan', descId: 'Daftar spesifikasi dan standar yang diimplementasikan.', slug: 'specifications', hidden: true },
      { title: 'Admin client', desc: 'Using the admin client to access the Admin REST API.', titleId: 'Admin client', descId: 'Menggunakan admin client untuk mengakses Admin REST API.', slug: 'admin-client', hidden: true },
      { title: 'Authorization client', desc: 'Using the authz client to administer and check permissions.', titleId: 'Authorization client', descId: 'Menggunakan authz client untuk mengelola dan memeriksa permission.', slug: 'authz-client', hidden: true },
      { title: 'Policy enforcer', desc: 'Using the policy enforcer in Java applications.', titleId: 'Policy enforcer', descId: 'Menggunakan policy enforcer di aplikasi Java.', slug: 'policy-enforcer', hidden: true },
      { title: 'Upgrading the Client Libraries', desc: 'How to upgrade the NQRust-Identity Client Libraries.', titleId: 'Upgrade Client Libraries', descId: 'Cara meng-upgrade NQRust-Identity Client Libraries.', slug: 'upgrading', hidden: true },
    ],
  },
  {
    key: 'high-availability',
    title: 'High Availability',
    titleId: 'High Availability',
    cards: [
      { title: 'High availability overview', desc: 'Explore the different NQRust-Identity high-availability architectures.', titleId: 'Ikhtisar high availability', descId: 'Menjelajahi arsitektur high-availability NQRust-Identity yang berbeda.', slug: 'introduction' },
    ],
  },
]

export function findCategory(key: string): Category | undefined {
  return CATEGORIES.find(c => c.key === key)
}

export function pickCard(card: Card, locale: string): { title: string; desc: string } {
  if (locale === 'id') {
    return { title: card.titleId ?? card.title, desc: card.descId ?? card.desc }
  }
  return { title: card.title, desc: card.desc }
}

export function pickCategoryTitle(cat: Category, locale: string): string {
  if (locale === 'id') return cat.titleId ?? cat.title
  return cat.title
}
