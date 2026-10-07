/** @type {import('next').NextConfig} */
const nextConfig = {
  // Alle pagina's zijn vooraf te bouwen (data komt uit data/*.json), dus de site wordt een map met
  // statische bestanden (`out/`) die Cloudflare uitserveert. Er is geen server nodig.
  // Gevolg: `redirects()` werkt niet in een statische export. De omgekeerde vergelijkingsparen
  // (holafly-vs-airalo -> airalo-vs-holafly) staan daarom in public/_redirects.
  output: "export",
  poweredByHeader: false,
};

export default nextConfig;
