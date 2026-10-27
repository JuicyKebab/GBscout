// site-xray-audit (27 okt) vond: gbscout.com en www.gbscout.com serveerden allebei
// rechtstreeks dezelfde content (beide custom domains op dit Worker-adres), zonder
// 301 tussen hen -- enkel de canonical-tag loste het indexeringsrisico op, niet het
// crawlbudget-verlies. Apex is canonical (al zo in elke pagina's <link rel="canonical">),
// dus www redirect hierheen.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.gbscout.com") {
      url.hostname = "gbscout.com";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
