import type { SocialObjects } from "./types";

export const SITE = {
  author: "Bradly Ovitt",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "Bradly Ovitt's Blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 4,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/baovitt",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/bradly-ovitt-49185a22b/",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:oobrad76@gmail.com",
    linkTitle: `Send an email to ${SITE.author}`,
    active: false,
  }
];
