/** E-Summit 2027 overall coordinators share the contact roster.
 * Department data otherwise remains the existing imported roster. */
import { COORDINATORS } from "./constants";

export type Member = {
  name: string;
  position: string;
  image: string; // full https Cloudinary URL
  linkedin: string;
  email: string;
  phoneDisplay?: string;
  phoneTel?: string;
};

/**
 * Cloudinary thumbnail helper: asks Cloudinary for a small, face-centred 4:5 image
 * (automatic format and high quality). Non-Cloudinary URLs are returned unchanged.
 */
export function cldThumb(url: string, w = 400): string {
  if (!url || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/w_${w},q_90,f_auto,c_fill,g_face,ar_4:5/`);
}

export const coreTeamMembers: Member[] = COORDINATORS.map(({ name, image, linkedin, email, phoneDisplay, phoneTel }) => ({
  name,
  image,
  linkedin,
  email,
  phoneDisplay,
  phoneTel,
  position: "Overall Coordinator",
}));

// Department Heads
export const headMembers: Member[] = [

  {
    name: "Ishan Srivastava",
    position: "Overall Competitions Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574670/IMG_8665_-_Ishan_Srivastava_vmorm5.png",
    linkedin: "https://www.linkedin.com/in/ishan-s-05b222193?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    email: "ishansri.srivastava@gmail.com",
  },
  {
    name: "Lavanya Lahane",
    position: "Competitions Management Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574672/Profile_photo_-_Lavanya_Yogendra_Lahane_nyzzda.jpg",
    linkedin: "https://www.linkedin.com/in/lavanyalahane/",
    email: "2023epb1271@iitrpr.ac.in",
  },
  {
    name: "Pragy Bagoriya",
    position: "Event Management Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574827/DSC08173_-_Pragy_Bagoriya_llkpth.jpg",
    linkedin: "https://www.linkedin.com/in/pragy-bagoriya-b0074a295",
    email: "2023eeb1234@iitrpr.ac.in",
  },
  {
    name: "Ayush Tyagi",
    position: "Content and Anchoring Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574665/ayush_tb_-_Ayush_Tyagi_fnhnpp.jpg",
    linkedin: "https://www.linkedin.com/in/ayush-tyagi-37154b2a4/",
    email: "2023csb1108@iitrpr.ac.in",
  },
  {
    name: "Yash Tikaram Hatwar",
    position: "Design Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773633824/DSC08634_-_Yash_Tikaram_trnqg3.jpg",
    linkedin: "https://www.linkedin.com/in/yash-hatwar-38319427b/",
    email: "yashhatwar99@gmail.com",
  },
  {
    name: "Rahul Sharma",
    position: "Hospitality Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574673/WhatsApp_Image_2026-03-06_at_5.11.54_PM_-_Rahul___shu0di.jpg",
    linkedin: "https://www.linkedin.com/in/rahul-sharma-7b38832b0/",
    email: "sharmarahul14916@gmail.com",
  },
  {
    name: "Kunal Dhiman",
    position: "Hospitality Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773583906/DSC09063_1_-_Kunal_Dhiman_jnmj1w.jpg",
    linkedin: "https://www.linkedin.com/in/kunal-dhiman-661541293/",
    email: "828kd000@gmail.com",
  },
  {
    name: "Vaibhav",
    position: "Intern Fair Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574673/WhatsApp_Image_2026-03-06_at_7.24.28_AM_-_Vaibhav___yfgy9a.jpg",
    linkedin: "https://www.linkedin.com/in/vaibhav-garg-753b10358",
    email: "2023ceb1052@iitrpr.ac.in",
  },
  {
    name: "Sumit Kumar",
    position: "Intern Fair and Creators Conclave Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773583760/WhatsApp_Image_2026-03-04_at_7.07.43_PM_-_Sumit_Kumar_zfmku6.jpg",
    linkedin: "https://www.linkedin.com/in/sumit-kumar-79a6902a8",
    email: "2023ceb1050@iitrpr.ac.in",
  },
  {
    name: "Ankur Prasad",
    position: "Intern Fair and Creators Conclave Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574670/IMG_20260210_220228_-_Ankur_Praveen_qacz6v.jpg",
    linkedin: "https://www.linkedin.com/in/ankur-prasad-b7b578293",
    email: "2023chb1059@iitrpr.ac.in",
  },
  {
    name: "Shweta Maurya",
    position: "Intern Fair and Creators Conclave Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574671/IMG_20260306_160335_-_Shweta_Maurya_blpmsn.jpg",
    linkedin: "https://www.linkedin.com/in/shweta-maurya-25b91b259/",
    email: "2022mcb1281@iitrpr.ac.in",
  },
  {
    name: "Lakshay",
    position: "Literary Lead Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574669/IMG_3392_-_Lakshay_Kumar_q6bmrp.jpg",
    linkedin: "https://www.linkedin.com/in/lakshay-kumar-43520b27a",
    email: "lakshaykumar.workspace@gmail.com",
  },
  {
    name: "Garv Raj",
    position: "Logistics Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574672/WhatsApp_Image_2026-01-17_at_4.29.29_PM-Photoroom_-_Garv_Raj_ruqdss.png",
    linkedin: "https://www.linkedin.com/in/garv-raj-31166a2a6/",
    email: "2023eeb1029@iitrpr.ac.in",
  },
    {
    name: "Aditya Khajuria",
    position: "Logistics Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574671/IMG-20250608-WA0023_-_Aditya_Khajuria_wzzgs3.jpg",
    linkedin: "https://www.linkedin.com/in/aditya-khajuria-27853330a",
    email: "2023mcb1323@iitrpr.ac.in",
  },
    {
    name: "Sarthak Gupta",
    position: "Media and Coverage Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574666/1752250647048_-_Sarthak_Gupta_da1vjm.jpg",
    linkedin: "https://www.linkedin.com/in/sarthak-gupta-319b422a8/",
    email: "2023eeb1243@iitrpr.ac.in",
  },
  {
    name: "Omm Shree",
    position: "Pronite Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574666/1772905383357_2_-_Omm_Shree_olzzlo.jpg",
    linkedin: "https://www.linkedin.com/in/omm-shree-wins",
    email: "2023meb1419@iitrpr.ac.in",
  },
  {
    name: "Aryan Singh",
    position: "Talks and Pro-nite Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574827/DSC08677_-_Aryan_Singh_rhysxw.jpg",
    linkedin: "https://www.linkedin.com/in/aryan-singh-824329287/",
    email: "2023csb1102@iitrpr.ac.in",
  },
  {
    name: "Shreshth Shukla",
    position: "Talks and Pronite Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773583843/DSC09101_-_Shreshth_Shukla_rkeudj.jpg",
    linkedin: "https://www.linkedin.com/in/shreshth-shukla-9446a328b/",
    email: "shreshth.shukla474@gmail.com",
  },
  {
    name: "Aarzu Malhotra",
    position: "Publicity Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574670/IMG_1803_-_Aarzu_Malhotra_ybu3ko.jpg",
    linkedin: "https://www.linkedin.com/in/aarzu-malhotra-8a2a15280",
    email: "2022mmb1368@iitrpr.ac.in",
  },
  {
    name: "Adarsh Kumar",
    position: "Publicity Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773584878/WhatsApp_Image_2026-03-05_at_14.24.09_-_Adarsh_Kumar_cn14eg.jpg",
    linkedin: "https://www.linkedin.com/in/adarsh-kumar-2a8809286/",
    email: "2023chb1058@iitrpr.ac.in",
  },
  {
    name: "Lakshya Vajpayee",
    position: "Security Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574673/WhatsApp_Image_2026-02-26_at_1.31.48_AM_-_Lakshya_Vajpayee_kyvdsp.jpg",
    linkedin: "https://www.linkedin.com/in/lakshya-vajpayee-37a00a246/",
    email: "lakshya.vajpyee07@outlook.com",
  },
  {
    name: "Desireddy Sreelakshmi",
    position: "Sponsorship Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773583986/IMG_4844_-_Desireddy_Sreelakshmi_aonziu.jpg",
    linkedin: "https://www.linkedin.com/in/desireddy-sreelakshmi-53639028a/",
    email: "2023ceb1027@iitrpr.ac.in",
  },
  {
    name: "Aditi Garg",
    position: "Sponsorship Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574672/Profile_-_Aditi_Garg_zpgkfb.jpg",
    linkedin: "https://linkedin.com/in/aditi-garg-3817b925a",
    email: "2022meb1289@iitrpr.ac.in",
  },
  {
    name: "Dev Jain",
    position: "Outreach Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1762323056/20251005_111547_-_Dev_Jain_uhwi9f.jpg",
    linkedin: "https://www.linkedin.com/in/dev-jain-605382282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    email: "2023ceb1028@iitrpr.ac.in"
  },
  {
    name: "Nishant Sahni",
    position: "Startup Expo Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574666/IMG_20260310_000901_-_Nishant_Sahni_tbzgfs.jpg",
    linkedin: "https://www.linkedin.com/in/nishant-sahni-a7b01130a",
    email: "nishantsahni04@gmail.com",
  },
  {
    name: "Shaurya Anant",
    position: "Startup Expo Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574671/IMG-20251007-WA0011_-_Shaurya_Anant_reax47.jpg",
    linkedin: "https://www.linkedin.com/in/shaurya-anant-7b2b11286/",
    email: "shauryainfinity23@gmail.com",
  },
  {
    name: "Yogesh Kumar",
    position: "Startup Expo & Investors Arena Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574668/20251126_114308_-_Yogesh_Kumar_mbo29j.jpg",
    linkedin: "https://www.linkedin.com/in/yogesh-kumar-0404a0371",
    email: "2023ceb1054@iitrpr.ac.in",
  },

  {
    name: "Sarthak Manav",
    position: "Startup Expo Investor’s Arena",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574674/185A0009_-_Sarthak_Manav_lmuwq0.jpg",
    linkedin: "https://www.linkedin.com/in/sarthak-manav-518673207?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    email: "2025dss1022@iitrpr.ac.in",
  },
  {
    name: "Palakpreet Kaur",
    position: "Startup Expo & Investors Arena Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773574671/Palakpreet_Kaur_-_Palakpreet_Kaur_zq7vjf.jpg",
    linkedin: "https://www.linkedin.com/in/palakpreet-kaur-baa168282/",
    email: "2022meb1327@iitrpr.ac.in",
  },

  {
    name: "Manajigari Harshitha",
    position: "Workshops & Hackathons Head",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1773583952/WhatsApp_Image_2026-03-05_at_9.21.20_PM_-_Manajigari_Harshitha_h2ugif.jpg",
    linkedin: "https://www.linkedin.com/in/harshitha-manajigari-692554253/",
    email: "2022eeb1189@iitrpr.ac.in",
  },
];

// Coordinators + New Heads
export const coordinatorMembers: Member[] = [
];
