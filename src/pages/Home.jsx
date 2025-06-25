import { Link } from "react-router-dom";
import Card from "../components/Card";

// --------------- Dummy Data (replace with real data from your backend) ---------------
const latestArticles = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD19Rqr039jzhjRrJXG2MVucW1muGz6QBmDfokZgwjdeBk6fZ8mo4NS0N0aXEjZ2bNc6wcLczIZ4Ct1951kr9yDHAugp3MJ6ejR1GhJ2gYUCuCJIzjOhvq4XVKcn9txxwB95apd8eyL8TPXdmhxq5dkZbvyAM-y2bmoJkECjqKSjZucV8kYdAeg3mOO47ymRYXEJ-roORvG3u6m7rM6Y2jODIOEto_K29_aN5Pp_MpJm-Ar5WEeJJGoulWLDzKr6xVrLUNyhbp6pg",
    title: "The Ultimate Guide to Instructional Design",
    desc: "Learn the fundamentals of instructional design and create effective learning experiences.",
    link: "/articles/1",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCecuSQPbs4vj3Vwm1AeG4XzqV_LgFJx5QMtXyJKo_xeBU8faUhNCvMf9vCu4PDXyaQC8BDUzwQ2R9c2D21ziuN-H4RPd7FyyARWW0srlRTzTCxUCgQ3EeSTZjnmiisT2HSzVpIBQH0EZ2Ep37nDbLBfPITBE1HNH6lehw_2tmXSmodWacdL-yMbscXiikFyhlEi7U1jhGTaQnu6yXhxQTiYV3sToaLh9V_6cmV3Fq0rZAevPD10pSydFrNf7IbbmZ0sYsDDUrRA",
    title: "Mastering Online Learning: Tips and Strategies",
    desc: "Discover how to design and deliver engaging online learning programs.",
    link: "/articles/2",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0cd07SAzkfofP3Qj47LQTCqNVaKPAmL4Uc9NJNUcLmsYJ3UhGX-QL3HOLLMDjhreyg5AAmgEObSKTyCqAB4HKQxt1Ndg1DfXpgrNPTNe1kZLyAfHnOrJDOk1kkz_pSkhGFiTd44_PVicNk0l7cUQGHoBlS5kCmb0nZnZdmCDrf52LYv-5oQq8i8Cguh74rPFsSAe3Ps2o_gDpdDfxLnDY8tKoMmH2K3lblsMNeqOV2DQupzZ2r7EsjlNNAULFatxCqpTfPEm2JQ",
    title: "Creating Engaging Learning Experiences",
    desc: "Explore techniques for creating interactive and memorable learning content.",
    link: "/articles/3",
  },
];

const theories = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfrHCyMqvTHkfDJ56qNnzxEl-QpbsAaEK-Lm0bzeFMaW3amT0q0RQvgGSWZiML66qX29B6SGqCAn4WvPgn53uQXvCDsz6TlN_HDf0NEg0pLZEPaZVhuoCVMTexR56NgbvKi_JbwAPm_9hwX0oqpQj7U_FtE4JQVXODF9_DmnvGO9EaSa80kHIRwwmknSvAKtQCfs03xVE6LdNLb_0sytKAmg698UodL6uoOMOWVmeSKpHvbmF1cvQqepF6uc3DCjhhNglTSMZADg",
    title: "Cognitive Load Theory",
    desc: "Understand how cognitive load affects learning and design materials accordingly.",
    link: "/theories/1",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAo6_mpk-mH8eAGJiAH-iUK21WquezrLgnKC3341B8-S-3Jubyr1j2Oc1jzYLMKtkJlCqmGSWLV7KA1SoAzK5kIgZlH3siTM04ZSsRAwQBJRIfiNuIW32g_qOi7cMWZn-b1MbQpsaz7sIxXubcUknnrgqXvY7nBnK7UKFkYhhNF6Qycwfs8ZefGTtNgdnP0cxoxcNIW_gLaDCNTLidyDhwevde6tb00pHCkWzHd6LnB3KDcKeVnpgGY2VfTf3gY1nV16RYlbOvpdw",
    title: "Constructivism",
    desc: "Explore the constructivist approach to learning and its implications for design.",
    link: "/theories/2",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmUPBSlhuGoNjBJWJCx3Ybefs519vDqyeTaEe-nz2Wj92u8pO_J0zpxYGMtzMBTTpPIxHLBfN75QNt1hXFBdgzP80twexOioOQck29vH_6ok1y-JpC7v0iZNTpqeq_xHHkd9fYHduriYEP8yZKrE6pNtQ0GWZ0ziJBJUmrAVGqT8z0cMcT4FPlIt28DlL8ZKeqxxZfsruhh5QakiTW4gbpJLVtvKWOTMCrjz3I0gcknh6LWFGQhSqV09p4oyCV4EFnhkSVCtPgpw",
    title: "Connectivism",
    desc: "Learn about connectivism and its relevance in the digital age.",
    link: "/theories/3",
  },
];

const videos = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMwSzVYyVNRPAVKCZSL3HmggVnGoKMZTsKtJC5hf60SKs9dOVMy_YL2UnU13ItImKBZ9UFWJHUCCGURixeHb7ApqPXU3wN2ZM77pfv-KoYc6USKDfg6IP6_zNrFMWz2QP9TT1WYXSA3bz4vRD5uvoPXPqQUhMJa0lnHZjnUCfK2Dyc4GwM4EeI8LOgsBDdZcrfk8eVmX93mtb7QB7nYXXzXP-f5Ww8kDrAj6hpyKxxiqlkPGeiWdSw2IhWEYD02FngjjgJW8RC6g",
    title: "Instructional Design Basics",
    desc: "A beginner's guide to the core principles of instructional design.",
    link: "/videos/1",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMBki1sy7vfY1nO5Go1bXcyuP3UjIKybJjj8LoruRkOtfyetAOgBUcOqLXoZ60Tmpe7EK9JxY5btYFc8tE0X3UjzERSUX5zoDZFS_Thr03U-2YUSwAi9Wq5d06pqaWceayf7CEjQmLZwiHVWK4jnZdfCRvoo2SUxCtNo0pIb77S2Lnve45rNQ2PfECerKyQ7o-d6WJoexseDIPkM1IuiP-skY36dawhyUro4jRGXFJZ2xtZJ-69kr7ueYmT_0BVvHOtgXP2ifseA",
    title: "Effective Presentation Techniques",
    desc: "Tips for delivering impactful presentations and engaging your audience.",
    link: "/videos/2",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvCc-Eo_QPgjFxHhMrOrgcBq85a01HCr8vRkaAz-M3876LpWpwI1toAsbQrJ1BKLxwcZqDYyxxFY2Y8ER5UA3ycxD2lnKPdUisupc5WiarUAEXKqkvHyJinV-mGq17P2G6cuPZsLmUSzfKLm-kFQ4jbJQoxh5a7n7rKpnkx6ccZ1Wi4hkbeIfxO5FD-JOZcTXCpffXsKR53c1YcQdr357UP9vSEs1Q_db2-1GF90xtqNQD_kRjYy7LtYELL2gjRuav-6AWwuq0GA",
    title: "Creating Engaging Video Content",
    desc: "Learn how to produce high-quality videos for learning and development.",
    link: "/videos/3",
  },
];

const jobs = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQK9YWoBxuuQSLv0fNeDp9OZh_C4MsjHJzVmC2n2VjDwdCIxBHyC-A9EshgPkwuvFuYKGWWu7w_2x6N0MpKMHYhu5uEl0f0SVVH9u-MVjhl6mmKy2eih_oRYH6s-DhI1X6EvsigCc8xmwJsEC6Qym4XoefcEEDrXEVqGT2k9l8tYF9exR_aC3FGQCRA_XVDaVs1NcCGdRgw0PrAmXRFV0TzOXlTay2Y1mGP8FWR-2Qr00OPpqJRRkJP0LVU2ym-WjkhHCpDV3mWQ",
    title: "Instructional Designer",
    desc: "Design and develop instructional materials for various learning environments.",
    link: "/jobs/1",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBc3zAy-I0_xa-Y-Ny5AuNWK7VvfotXH3GYzb5I9mo26THss9T2E1ucllaO1fyFkYmtQI5_vQxUSkB5JvE0ZD0fdQSG11pLVfJni-vPtA4thKhOqtTo5WAiH-vz2AiCd5obV4O1BQDVRgMM3y9eMFinrCQh66QSanePEXizPbhbo8Xpe8kN1M7KMB6iaLLbimB5AWwjEIUOFj69zy1ZvKIgOrqz8KtERBOUmzG3e5htxvSU5gl1P-1DzMq2VUjqPXRFvC4on_HyMQ",
    title: "E-Learning Developer",
    desc: "Create engaging and interactive e-learning courses and modules.",
    link: "/jobs/2",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdqQdSwhGXOQvCd5stWy_LKhCbITTWDf7Y0y-NEHIxNPOvM4jzi0Ko71QCbCCtBidmTwhlzaOz3Kcusfyt57BGWOLGyd15brWhO90BABpQb88r1zeWORCrHGTYiXTb6QVc8UGrMTnZBGADiTT9vcGaEXxEz1fFcIX9DojcCffSvFv_T8imOK_BvfxhmTEfdFkD4Qz7HAmkc2sriE3J8dedYoXK73xkehs-3Puft_PRZ-qUlj5jdu8ITRqTFaaiOe0CUS6aKiJ_Rg",
    title: "Learning Experience Designer",
    desc: "Design holistic learning experiences that meet the needs of learners.",
    link: "/jobs/3",
  },
];

const spotlights = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCIl_4bMjvEIH6o_-ry3E-wF0b5Tgeeqi2FRmDj9k1Ic0gWy6D0R1UQ6VmAOZBfigF7rFrJi9L_0PbHWUGPyS3JyHUTf0MgAzNE1xasJGQd5ECfnvRXrwgf5phyzqe2sxBNJDlRwrb8hP-GhM5o7Dn-wWGoFujlFe3zfO27rxnbyGA_Wpbqkzj8Gc4Y-8BRKmGNrrSI57glhQuznyl2eUxGHCGOfBf4FtX3xSxgI_o9ANnosrJaBvdVvc-0lirlB_6DhfhHLc16Pw",
    title: "Dr. Amelia Bennett",
    desc: "A leading expert in cognitive load theory and instructional design.",
    link: "#",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5-_sxUNnBD2f41TAojgF6jj9Vi8oOaDCW9vykQWVCmngExSlk_Adgs2Py820BQ481bR10Wf14BzXEJUXwepODbPeFBlqUkDayoqES191S2DYAVMJDaSb3scTAO0ujTz2Xn4z76vOH33WlitFjaJkFGdVqECgpoBjl-PiNtAcjanT7Dpfp6waMfsrDFd1A70CIHaDhs4qaGd74TFS5EEBaM98TsjbdZq9dzaIgYTvrRevdVAQtU_8dHfTtO-2Luv2tfcOKnTLQAA",
    title: "Ethan Harper",
    desc: "An experienced e-learning developer and learning experience designer.",
    link: "#",
  },
];

// --------------- Main Home Page ---------------
export default function Home() {
  return (
    <section className="min-h-screen w-screen w-full bg-neutral-50 flex flex-col items-center font-[Newsreader,sans-serif] pb-20">
      <HeroBanner />

      <SectionCards title="Latest Articles" items={latestArticles} />
      <SectionCards title="Instructional Design Theories" items={theories} />
      <SectionCards title="Videos" items={videos} />
      <SectionCards title="Jobs" items={jobs} />
      <SpotlightsSection items={spotlights} />
    </section>
  );
}

// --------------- Components ---------------

// Navbar (Minimal - expand as needed)
// function Navbar() {
//   return (
//     <header className="flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-4 border-b border-neutral-200 bg-neutral-50">
//       <div className="flex items-center gap-4">
//         <div className="size-6 text-blue-600">
//           <svg viewBox="0 0 48 48" fill="currentColor" width={28} height={28}>
//             <path d="M13.8 30.57C16.72 29.88 20.22 29.48 24 29.48c3.78 0 7.28.4 10.17 1.09 2.74.65 5.82 2.19 7.18 3.25L24.85 7.36a1 1 0 0 0-1.7 0L6.64 33.84c1.37-1.06 4.44-2.6 7.18-3.27Z" />
//             <path
//               fillRule="evenodd"
//               clipRule="evenodd"
//               d="M40 35.76c0-.02-.01-.03-.01-.08 0-.01-.01-.03-.02-.06-.03-.11-.08-.24-.14-.38-.02-.05-.04-.1-.07-.14-1.27-.87-3.8-2.12-6.08-2.66-2.72-.65-6.06-1.04-9.68-1.04-3.62 0-6.96.39-9.68 1.04-2.29.54-4.81 1.79-6.08 2.66-.03.04-.05.09-.07.14-.06.14-.11.27-.14.38-.01.03-.02.05-.02.06 0 .05-.01.06-.01.08 0 .02.01.35.68.89.66.54 1.74 1.13 3.29 1.65C14.92 39.32 19.19 40 24 40s9.08-.68 12.07-1.7c1.55-.52 2.63-1.11 3.29-1.65.67-.54.68-.87.68-.89ZM5 32.77l16.5-26.47c1.17-1.88 3.92-1.88 5.09 0l16.51 26.48c.02.02.04.05.06.08l-1.75 1.01c1.75-1.01 1.75-1.01 1.75-1.01l.01.01.01.01.01.01.01.02c.01.01.02.03.03.06.02.04.06.11.11.2.07.12.17.32.26.53.17.4.48 1.13.48 1.89 0 1.71-1 3.05-2.14 4.01-1.16.95-2.72 1.73-4.48 2.34C33.87 43.28 29.13 44 24 44s-9.87-.72-13.37-1.94C8.86 41.47 7.3 40.7 6.15 39.72 5 38.77 4 37.43 4 35.74c0-.86.29-1.65.49-2.11.11-.25.22-.46.3-.6.04-.08.09-.15.12-.19l.01-.01.01-.01ZM35.99 29L24 9.78 12.01 29c.46-.14.92-.27 1.36-.37 3.07-.73 6.73-1.15 10.63-1.15 3.9 0 7.56.42 10.63 1.15.44.1.9.23 1.36.37Z"
//             />
//           </svg>
//         </div>
//         <span className="font-bold text-xl tracking-tight text-gray-900">Sooper Boring</span>
//         <nav className="hidden md:flex gap-6 ml-10">
//           <Link to="/articles" className="text-gray-700 hover:text-blue-700 text-base">Articles</Link>
//           <Link to="/theories" className="text-gray-700 hover:text-blue-700 text-base">Theories</Link>
//           <Link to="/videos" className="text-gray-700 hover:text-blue-700 text-base">Videos</Link>
//           <Link to="/jobs" className="text-gray-700 hover:text-blue-700 text-base">Jobs</Link>
//         </nav>
//       </div>
//       <div className="flex gap-4 items-center">
//         <input
//           className="rounded-xl px-4 py-2 bg-neutral-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
//           placeholder="Search"
//           type="text"
//         />
//         <button className="bg-neutral-200 hover:bg-neutral-300 rounded-full px-4 py-2 font-bold text-gray-800">
//           <span>User</span>
//         </button>
//       </div>
//     </header>
//   );
// }

// Hero banner
function HeroBanner() {
  return (
    <div
      className="w-full flex flex-col items-start justify-end min-h-[380px] max-w-5xl mx-auto mt-10 px-8 py-8 rounded-xl bg-cover bg-center shadow"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-tR9rmSDwI7QaAQdo4o4Tob0QnLHMLEE4UNyH0pCllrN5BKsfo7GMoQOCUBPl6eMpfl0Ag5EY4QGJm3hbXOI0HimqTp9EDJk23145L5pgg4CwgvooBzmskDiyAnyaUjb3iJVQr5owXa3ZoI7ji_B7Tl3WIU_OY3ew7ORrbG-6dlMI0Y_10a8lzCOoml_uZnrGPBnSrGYygdW0X5tM35qMhNczeyqbZnvUtuw7SmRT1qDuylHkIw4DWObEWZ_kHNlh3r_hLkWDGw')",
      }}
    >
      <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg">
        Instructional Design Theories
      </h1>
      <p className="text-white text-base md:text-lg mb-6 drop-shadow-lg max-w-xl">
        Explore the world of instructional design theories with Sooper Boring. We provide in-depth articles, videos, and resources to help you master the art of effective learning design.
      </p>
      <Link
        to="/articles"
        className="bg-black text-white rounded-full px-6 py-3 font-bold shadow hover:bg-neutral-800"
      >
        Explore Articles
      </Link>
    </div>
  );
}

// Generic Section for Cards (scrollable horizontally)
function SectionCards({ title, items }) {
  return (
    <div className="w-full max-w-5xl mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 px-2">{title}</h2>
      <div className="flex gap-6 overflow-x-auto px-2 pb-2 hide-scrollbar">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="min-w-[260px] max-w-[320px] bg-white rounded-xl shadow flex flex-col hover:scale-105 transition-transform"
          >
            <div
              className="h-40 w-full bg-center bg-cover rounded-t-xl"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Designer Spotlights - Circular cards
function SpotlightsSection({ items }) {
  return (
    <div className="w-full max-w-5xl mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 px-2">Instructional Designers Spotlight</h2>
      <div className="flex gap-8 overflow-x-auto px-2 pb-2 hide-scrollbar">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center min-w-[170px] max-w-[180px] bg-white rounded-xl shadow px-4 py-5"
          >
            <div
              className="w-24 h-24 rounded-full bg-center bg-cover mb-3"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <h3 className="text-base font-semibold text-gray-800">{item.title}</h3>
            <p className="text-xs text-gray-500 text-center">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hides ugly scrollbars in Chrome/Edge
// Put this in your global CSS if you want to hide horizontal scrollbars for cards:
// .hide-scrollbar::-webkit-scrollbar { display: none; }
