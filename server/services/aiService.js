const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Domain-specific question templates
const questionTemplates = {
  Technology: [
    'Explain the concept of {topic} and its real-world applications.',
    'What are the advantages and disadvantages of {topic}?',
    'How would you implement {topic} in a production environment?',
    'Describe a challenging technical problem you solved using {topic}.',
    'What are the best practices for {topic}?',
  ],
  Marketing: [
    'How would you develop a marketing strategy for {topic}?',
    'What metrics would you use to measure the success of {topic}?',
    'Describe a successful marketing campaign you would create for {topic}.',
    'How do you stay updated with marketing trends in {topic}?',
    'What challenges do you see in {topic} marketing?',
  ],
  Sales: [
    'How would you approach a potential client interested in {topic}?',
    'Describe your sales process for {topic} products/services.',
    'How do you handle objections when selling {topic}?',
    'What strategies do you use to close deals in {topic}?',
    'How do you build long-term relationships with {topic} clients?',
  ],
  HR: [
    'How would you handle a conflict between team members in {topic}?',
    'Describe your approach to talent acquisition for {topic} roles.',
    'How do you ensure employee engagement in {topic} environments?',
    'What policies would you implement for {topic} workplace?',
    'How do you measure employee performance in {topic}?',
  ],
  Finance: [
    'Explain the financial implications of {topic}.',
    'How would you analyze the financial health of a {topic} company?',
    'What risk management strategies apply to {topic}?',
    'Describe your approach to budgeting for {topic}.',
    'How do you ensure compliance in {topic} financial operations?',
  ],
  'Data Science': [
    'How would you approach a {topic} data analysis problem?',
    'What machine learning techniques would you use for {topic}?',
    'Describe your data preprocessing pipeline for {topic}.',
    'How do you validate models in {topic} applications?',
    'What are the ethical considerations in {topic} data science?',
  ],
};

const domainTopics = {
  Technology: ['cloud computing', 'microservices', 'API design', 'database optimization', 'security'],
  Marketing: ['digital marketing', 'content strategy', 'social media', 'SEO', 'brand management'],
  Sales: ['B2B sales', 'customer relationship', 'lead generation', 'negotiation', 'product demos'],
  HR: ['talent management', 'organizational development', 'employee relations', 'compensation', 'training'],
  Finance: ['financial planning', 'investment analysis', 'risk assessment', 'budgeting', 'accounting'],
  'Data Science': ['machine learning', 'data visualization', 'statistical analysis', 'predictive modeling', 'big data'],
};

async function generateQuestion(domain, difficulty = 'medium') {
  try {
    const topics = domainTopics[domain] || ['general'];
    const templates = questionTemplates[domain] || questionTemplates.Technology;
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const questionText = template.replace('{topic}', topic);

    // Use OpenAI to refine the question (if configured)
    if (!openai) {
      return questionText;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert interviewer. Generate a clear, concise interview question for the ${domain} domain. The question should be ${difficulty} difficulty level. IMPORTANT: You must respond ONLY in English. Every question must be written entirely in English. Do not use any other language.`,
        },
        {
          role: 'user',
          content: `Refine this question in English only: "${questionText}" Make it more specific and interview-appropriate. Respond with the question in English only.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to template question
    const topics = domainTopics[domain] || ['general'];
    const templates = questionTemplates[domain] || questionTemplates.Technology;
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{topic}', topic);
  }
}

async function evaluateResponse(domain, question, transcript, duration) {
  try {
    if (!openai) {
      // Enhanced fallback evaluation based on transcript length and keywords
      const transcriptLength = transcript.length;
      const wordCount = transcript.split(/\s+/).length;
      const hasDomainKeywords = checkDomainKeywords(domain, transcript);
      
      let baseScore = 60;
      if (wordCount > 50) baseScore += 10;
      if (wordCount > 100) baseScore += 10;
      if (hasDomainKeywords) baseScore += 15;
      if (transcriptLength > 200) baseScore += 5;
      
      baseScore = Math.min(85, baseScore);
      
      return {
        overallScore: baseScore,
        domainScore: hasDomainKeywords ? baseScore + 5 : baseScore - 5,
        communicationScore: wordCount > 30 ? baseScore + 5 : baseScore - 5,
        technicalScore: baseScore,
        summary: `Response evaluated based on length (${wordCount} words) and content analysis. Configure OPENAI_API_KEY for detailed AI evaluation.`,
        strengths: wordCount > 50 ? ['Provided detailed response', 'Good communication length'] : ['Attempted to answer'],
        areasForImprovement: wordCount < 50 ? ['Could provide more detail', 'Expand on your thoughts'] : ['Consider adding more specific examples'],
        domainSpecificFeedback: `Set OPENAI_API_KEY to enable domain-specific scoring for ${domain}.`,
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert interviewer and evaluator with deep knowledge in ${domain}. 
          Evaluate candidate responses with precision, considering:
          1. Relevance and accuracy to the question
          2. Domain-specific knowledge and expertise
          3. Clarity of communication and articulation
          4. Technical depth and conceptual understanding
          5. Confidence and professional presentation
          
          Be fair but thorough. Provide constructive feedback that helps candidates improve.
          Score on a 0-100 scale where:
          - 90-100: Exceptional, demonstrates mastery
          - 80-89: Very good, strong understanding
          - 70-79: Good, solid knowledge with room for growth
          - 60-69: Adequate, basic understanding
          - Below 60: Needs significant improvement`,
        },
        {
          role: 'user',
          content: `Evaluate this interview response in detail:

Domain: ${domain}
Question: "${question}"
Candidate Response: "${transcript}"
Interview Duration: ${duration} minutes
Response Length: ${transcript.split(/\s+/).length} words

Provide a comprehensive evaluation in this exact JSON format (no markdown, just JSON):
{
  "overallScore": <number 0-100>,
  "domainScore": <number 0-100, how well they demonstrated ${domain} knowledge>,
  "communicationScore": <number 0-100, clarity, articulation, structure>,
  "technicalScore": <number 0-100, technical accuracy and depth>,
  "summary": "<2-3 sentence summary of their performance>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "areasForImprovement": ["<specific area 1>", "<specific area 2>", "<specific area 3>"],
  "domainSpecificFeedback": "<detailed 3-4 sentence feedback specific to ${domain} domain, highlighting what they did well and what they could improve>"
}

Be specific and actionable in your feedback.`,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent scoring
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse JSON from response
    let evaluation;
    try {
      // Try direct JSON parse first
      evaluation = JSON.parse(responseText);
      
      // Validate scores are in range
      evaluation.overallScore = Math.max(0, Math.min(100, evaluation.overallScore || 70));
      evaluation.domainScore = Math.max(0, Math.min(100, evaluation.domainScore || 70));
      evaluation.communicationScore = Math.max(0, Math.min(100, evaluation.communicationScore || 70));
      evaluation.technicalScore = Math.max(0, Math.min(100, evaluation.technicalScore || 70));
      
      // Ensure arrays exist
      if (!Array.isArray(evaluation.strengths)) evaluation.strengths = ['Good response'];
      if (!Array.isArray(evaluation.areasForImprovement)) evaluation.areasForImprovement = ['Could improve'];
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', responseText);
      // Enhanced fallback evaluation
      const wordCount = transcript.split(/\s+/).length;
      const hasDomainKeywords = checkDomainKeywords(domain, transcript);
      
      let baseScore = 65;
      if (wordCount > 50) baseScore += 10;
      if (wordCount > 100) baseScore += 10;
      if (hasDomainKeywords) baseScore += 10;
      
      baseScore = Math.min(85, baseScore);
      
      evaluation = {
        overallScore: baseScore,
        domainScore: hasDomainKeywords ? baseScore + 5 : baseScore - 5,
        communicationScore: wordCount > 30 ? baseScore + 5 : baseScore - 5,
        technicalScore: baseScore,
        summary: 'Response evaluated based on content analysis. AI evaluation encountered a parsing issue.',
        strengths: wordCount > 50 ? ['Detailed response', 'Good communication'] : ['Attempted to answer'],
        areasForImprovement: wordCount < 50 ? ['Provide more detail'] : ['Consider more examples'],
        domainSpecificFeedback: responseText.substring(0, 400) || `Response evaluated for ${domain} domain.`,
      };
    }

    return evaluation;
  } catch (error) {
    console.error('Error evaluating response:', error);
    // Fallback evaluation
    return {
      overallScore: 70,
      domainScore: 70,
      communicationScore: 70,
      technicalScore: 70,
      summary: 'Response was evaluated. Some technical issues occurred during AI evaluation.',
      strengths: ['Attempted to answer the question'],
      areasForImprovement: ['Could improve clarity', 'More examples would help'],
      domainSpecificFeedback: 'Evaluation completed with basic scoring.',
    };
  }
}

// Helper function to check domain keywords
function checkDomainKeywords(domain, transcript) {
  const keywords = {
    Technology: ['code', 'software', 'development', 'system', 'application', 'programming', 'algorithm', 'database', 'api', 'framework'],
    Marketing: ['campaign', 'brand', 'audience', 'strategy', 'social media', 'content', 'seo', 'analytics', 'engagement', 'conversion'],
    Sales: ['client', 'customer', 'revenue', 'deal', 'prospect', 'negotiation', 'relationship', 'pipeline', 'close', 'quota'],
    HR: ['employee', 'talent', 'recruitment', 'training', 'performance', 'culture', 'team', 'organization', 'development', 'retention'],
    Finance: ['budget', 'investment', 'financial', 'analysis', 'revenue', 'cost', 'profit', 'accounting', 'risk', 'valuation'],
    'Data Science': ['data', 'analysis', 'model', 'machine learning', 'statistics', 'algorithm', 'prediction', 'dataset', 'insight', 'visualization'],
  };
  
  const domainKeywords = keywords[domain] || [];
  const lowerTranscript = transcript.toLowerCase();
  return domainKeywords.some(keyword => lowerTranscript.includes(keyword.toLowerCase()));
}

module.exports = {
  generateQuestion,
  evaluateResponse,
};
