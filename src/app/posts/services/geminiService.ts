
// A mock service to simulate Gemini API calls.
// In a real application, this would use a library like genkit to call the LLM.

import { PostCategory, PostType } from '../types';

export const suggestCategoryAndType = async (title: string, content: string): Promise<{ category: PostCategory, type: PostType }> => {
  console.log('AI analyzing for category and type:', { title, content });
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const lowerContent = (title + ' ' + content).toLowerCase();
  
  // Simple keyword matching for demo
  if (lowerContent.includes('how to') || lowerContent.includes('question') || lowerContent.includes('?')) {
    return { category: PostCategory.Product, type: PostType.Question };
  }
  if (lowerContent.includes('hire') || lowerContent.includes('team')) {
    return { category: PostCategory.HR, type: PostType.Discussion };
  }
  if (lowerContent.includes('revenue') || lowerContent.includes('funding')) {
    return { category: PostCategory.Finance, type: PostType.Question };
  }
  if (lowerContent.includes('celebrate') || lowerContent.includes('achieved')) {
    return { category: PostCategory.Marketing, type: PostType.Win };
  }
  if (lowerContent.includes('stuck') || lowerContent.includes('error')) {
    return { category: PostCategory.Tools, type: PostType.Help };
  }

  return { category: PostCategory.Operations, type: PostType.Discussion };
};

export const suggestTags = async (title: string, content: string, category: PostCategory): Promise<string[]> => {
    console.log('AI analyzing for tags:', { title, content, category });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo logic, not real AI
    const tags = new Set<string>();
    tags.add(category.toLowerCase());
    
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('saas')) tags.add('SaaS');
    if (text.includes('b2b')) tags.add('B2B');
    if (text.includes('churn')) tags.add('CustomerRetention');
    if (text.includes('marketing')) tags.add('MarketingStrategy');
    if (text.includes('growth')) tags.add('GrowthHacking');
    if (text.includes('react')) tags.add('ReactJS');

    return Array.from(tags).slice(0, 5); // Return up to 5 tags
};

export const suggestAudience = async (title: string, content: string): Promise<{ sector: string, subSector: string, industry: string }> => {
    console.log('AI analyzing for audience:', { title, content });
    await new Promise(resolve => setTimeout(resolve, 1200));

    const text = (title + ' ' + content).toLowerCase();

    if (text.includes('software') || text.includes('app') || text.includes('saas')) {
        return {
            sector: "Information",
            subSector: "Software Publishing",
            industry: "Application Software"
        }
    }
    if (text.includes('consulting') || text.includes('client')) {
        return {
            sector: "Professional, Scientific, and Technical Services",
            subSector: "Management, Scientific, and Technical Consulting Services",
            industry: "Marketing Consulting"
        }
    }

    return {
        sector: "Professional, Scientific, and Technical Services",
        subSector: "Computer Systems Design and Related Services",
        industry: "Custom Computer Programming"
    }
}
