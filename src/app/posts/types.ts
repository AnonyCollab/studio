
export enum BusinessStage {
    Idea = "Idea",
    Early = "Early",
    Growth = "Growth",
    Established = "Established"
}

export enum BusinessModel {
    Startup = "Startup",
    Agency = "Agency",
    SmallBusiness = "Small Business",
    Enterprise = "Enterprise",
    Creator = "Creator"
}

export interface UserProfile {
    stage: BusinessStage | null;
    businessModel: BusinessModel | null;
    sector: string;
    subSector: string;
    industry: string;
}

export enum PostCategory {
    Finance = "Finance",
    Marketing = "Marketing",
    HR = "HR",
    Operations = "Operations",
    Tools = "Tools",
    Legal = "Legal",
    Sales = "Sales",
    Product = "Product",
    Networking = "Networking"
}
  
export enum PostType {
    Question = "Question",
    Discussion = "Discussion",
    Help = "Help Request",
    Win = "Success Story",
    Resource = "Resource Sharing",
    Announcement = "Announcement",
    CaseStudy = "Case Study"
}

export interface PostFormState {
    title: string;
    category: PostCategory | null;
    type: PostType | null;
    audienceSector: string;
    audienceSubSector: string;
    audienceIndustry: string;
    summaryProblem: string;
    detailsProblem: string;
    summaryTried: string;
    detailsTried: string;
    summaryOutcome: string;
    detailsOutcome: string;
    tags: string[];
    images: File[];
}

export const SECTORS_DATA = [
  {
    name: "Agriculture, Forestry, Fishing and Hunting",
    subSectors: [
      { name: "Crop Production", industries: ["Soybean Farming", "Corn Farming", "Wheat Farming"] },
      { name: "Animal Production", industries: ["Cattle Ranching", "Hog and Pig Farming", "Poultry and Egg Production"] },
    ],
  },
  {
    name: "Information",
    subSectors: [
      { name: "Software Publishing", industries: ["Application Software", "Game Software", "Operating Systems"] },
      { name: "Telecommunications", industries: ["Wireless Carriers", "Wired Carriers", "Satellite Telecommunications"] },
    ],
  },
  {
    name: "Professional, Scientific, and Technical Services",
    subSectors: [
      { name: "Computer Systems Design and Related Services", industries: ["Custom Computer Programming", "Computer Systems Design", "Computer Facilities Management"] },
      { name: "Management, Scientific, and Technical Consulting Services", industries: ["Administrative Management Consulting", "Human Resources Consulting", "Marketing Consulting"] },
    ],
  }
];
