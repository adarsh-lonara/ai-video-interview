const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { interviewSessions, interviewResponses } = require('../data/mockDb');
const { generateQuestion, evaluateResponse } = require('../services/aiService');

// Create interview session
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { domain, duration } = req.body;

    if (!domain || !duration) {
      return res.status(400).json({ message: 'Domain and duration are required' });
    }

    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user.userId,
      domain,
      duration: parseInt(duration),
      startTime: new Date(),
      status: 'pending',
      questions: [],
    };

    interviewSessions.push(session);

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get questions for interview (initial load)
router.get('/:sessionId/questions', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = interviewSessions.find((s) => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Generate first question
    if (session.questions.length === 0) {
      const questionText = await generateQuestion(session.domain, 'easy');
      const firstQuestion = {
        id: `q_${Date.now()}_0`,
        question: questionText,
      };
      session.questions.push(firstQuestion);
      session.status = 'in-progress';
    }

    res.json({ questions: session.questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get next question dynamically
router.post('/:sessionId/next-question', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { timeRemaining } = req.body; // in seconds
    const session = interviewSessions.find((s) => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Determine difficulty based on time remaining and question number
    const questionNumber = session.questions.length;
    const timeRemainingMinutes = timeRemaining / 60;
    const timePerQuestion = session.duration / Math.max(3, Math.ceil(session.duration / 2.5)); // ~2.5 min per question
    
    let difficulty = 'medium';
    if (questionNumber === 0) {
      difficulty = 'easy';
    } else if (timeRemainingMinutes < timePerQuestion * 0.5) {
      difficulty = 'hard';
    } else if (questionNumber >= Math.ceil(session.duration / 2.5)) {
      difficulty = 'hard';
    }

    const questionText = await generateQuestion(session.domain, difficulty);
    const newQuestion = {
      id: `q_${Date.now()}_${questionNumber}`,
      question: questionText,
    };

    session.questions.push(newQuestion);

    res.json({ question: newQuestion });
  } catch (error) {
    console.error('Get next question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit response
router.post('/response', authenticateToken, async (req, res) => {
  try {
    const { sessionId, questionId, transcript, videoUrl } = req.body;

    if (!sessionId || !questionId || !transcript) {
      return res.status(400).json({ message: 'Session ID, question ID, and transcript are required' });
    }

    const session = interviewSessions.find((s) => s.id === sessionId);
    if (!session || session.userId !== req.user.userId) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const response = {
      id: `response_${Date.now()}`,
      sessionId,
      questionId,
      transcript,
      videoUrl,
      timestamp: new Date(),
    };

    interviewResponses.push(response);

    res.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// End interview and get results
router.post('/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = interviewSessions.find((s) => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get all responses for this session
    const responses = interviewResponses.filter((r) => r.sessionId === sessionId);

    if (responses.length === 0) {
      return res.status(400).json({ message: 'No responses found for this session' });
    }

    // Evaluate all responses
    let overallScore = 0;
    let domainScore = 0;
    let communicationScore = 0;
    let technicalScore = 0;
    const allStrengths = [];
    const allAreasForImprovement = [];
    const summaries = [];

    for (const response of responses) {
      const question = session.questions.find((q) => q.id === response.questionId);
      if (question) {
        const evaluation = await evaluateResponse(
          session.domain,
          question.question,
          response.transcript,
          session.duration
        );

        overallScore += evaluation.overallScore;
        domainScore += evaluation.domainScore;
        communicationScore += evaluation.communicationScore;
        technicalScore += evaluation.technicalScore;
        allStrengths.push(...evaluation.strengths);
        allAreasForImprovement.push(...evaluation.areasForImprovement);
        summaries.push(evaluation.summary);
      }
    }

    // Calculate averages
    const responseCount = responses.length;
    const feedback = {
      overallScore: Math.round(overallScore / responseCount),
      domainScore: Math.round(domainScore / responseCount),
      communicationScore: Math.round(communicationScore / responseCount),
      technicalScore: Math.round(technicalScore / responseCount),
      summary: summaries.join(' ').substring(0, 500),
      strengths: [...new Set(allStrengths)].slice(0, 5),
      areasForImprovement: [...new Set(allAreasForImprovement)].slice(0, 5),
      domainSpecificFeedback: `Based on your ${session.domain} interview responses, you demonstrated understanding of key concepts. Continue building on your strengths while addressing the areas mentioned above.`,
    };

    // Update session
    session.status = 'completed';
    session.endTime = new Date();
    session.score = feedback.overallScore;
    session.feedback = feedback;

    res.json({
      score: feedback.overallScore,
      feedback,
    });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
