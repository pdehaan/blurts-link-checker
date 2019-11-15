const got = require("got");
const link = require("linkinator");

const pages = [
  "/",
  "/breaches"
];
main(pages);

async function main(pages=[], domain="https://monitor.firefox.com") {
  let breaches = await getBreaches(domain);
  for (const breach of breaches) {
    pages.push(`/breach-details/${breach.Name}`);
  }

  for (const page of pages) {
    const href = new URL(page, domain).href;
    const results = await link.check({
      path: href,
      linksToSkip: [
        'https://www.haveibeenpwned.com'
      ]
    });
    if (!results.passed) {
      const broken = results.links.filter(link => !["OK", "SKIPPED"].includes(link.state));
      if (broken.length) {
        console.log(href);
        broken.forEach(link => console.log(`[${link.status || link.state}] ${link.url}`));
      }
    }
  }
  process.exit();
}

async function getBreaches(domain) {
  const href = new URL("/hibp/breaches", domain);
  const res = await got.get(href, {json: true});
  return res.body;
}
