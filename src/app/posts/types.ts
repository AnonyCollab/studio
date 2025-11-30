
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
