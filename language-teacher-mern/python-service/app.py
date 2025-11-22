from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.3-70b-versatile"

def build_system_prompt(conversation):
    """Build system prompt based on conversation settings"""
    language = conversation.get('language', 'Spanish')
    session_type = conversation.get('sessionType', 'freeform')
    scenario = conversation.get('scenario', '')
    skill_focus = conversation.get('skillFocus', '')
    persona = conversation.get('persona', 'patient_grandparent')
    adaptive_difficulty = conversation.get('adaptiveDifficulty', True)
    current_difficulty = conversation.get('currentDifficultyLevel', 'medium')
    bilingual_mode = conversation.get('bilingualMode', False)
    
    # Persona descriptions
    persona_descriptions = {
        'patient_grandparent': 'patient, gentle grandparent figure',
        'enthusiastic_friend': 'enthusiastic, encouraging friend',
        'formal_business': 'professional, formal business partner',
        'socratic_questioner': 'Socratic teacher who asks thought-provoking questions'
    }
    
    persona_behaviors = {
        'patient_grandparent': 'Use simple, clear language. Be extremely patient and encouraging. Break down complex concepts.',
        'enthusiastic_friend': 'Be casual, upbeat, and supportive. Use everyday language and expressions. Show excitement for their progress.',
        'formal_business': 'Maintain professional tone. Use business-appropriate vocabulary and formal structures. Be direct but polite.',
        'socratic_questioner': 'Ask thought-provoking questions that make the student think critically. Challenge them intellectually while being supportive.'
    }
    
    prompt = f"""You are a {persona_descriptions.get(persona, 'friendly language teacher')} helping a student practice {language}.

CRITICAL RULES:
1. Respond EXCLUSIVELY in {language}. Never use English in your response unless explicitly instructed.
2. Keep responses natural, conversational, and appropriate to the context.
3. {persona_behaviors.get(persona, 'Be friendly and supportive')}
4. Encourage continued conversation by asking follow-up questions.
5. Be patient and supportive.

GENTLE NUDGE CORRECTIONS:
When the student makes a mistake, subtly correct it within your natural response by echoing back the correct form. 
Example: If they say "I go yesterday", respond with "Ah, you went yesterday? Tell me more!"
Don't explicitly point out the error unless it's very important. Just model the correct usage naturally.
This helps them learn through exposure without feeling constantly corrected.
"""
    
    # Add session-specific context
    if session_type == 'scenario' and scenario:
        scenario_contexts = {
            'job_interview': '\nSCENARIO: Job Interview\nYou are conducting a job interview. Ask relevant questions about their experience, skills, and qualifications. Keep it realistic but supportive.',
            'restaurant': '\nSCENARIO: Restaurant\nYou are a waiter/waitress. Help them order food, make recommendations, explain menu items, and handle typical restaurant interactions.',
            'travel': '\nSCENARIO: Travel Survival\nYou are a helpful local. Assist with directions, recommendations, cultural tips, and common travel situations.',
            'shopping': '\nSCENARIO: Shopping\nYou are a shop assistant. Help them find items, discuss prices, sizes, colors, and complete purchases.',
            'debate': '\nSCENARIO: Debate\nEngage in a friendly debate about interesting topics. Challenge their opinions respectfully and encourage critical thinking.',
            'doctor': '\nSCENARIO: Doctor Visit\nYou are a doctor. Ask about symptoms, medical history, and provide advice. Use appropriate medical vocabulary.'
        }
        prompt += scenario_contexts.get(scenario, '')
    
    elif session_type == 'skill' and skill_focus:
        skill_contexts = {
            'past_tenses': '\nSKILL FOCUS: Past Tenses\nEncourage the student to talk about past events. Use past tenses naturally in your responses. Gently correct their past tense usage when needed.',
            'future_tenses': '\nSKILL FOCUS: Future Tenses\nGuide conversations toward future plans and predictions. Model correct future tense usage. Help them practice different future forms.',
            'conditionals': '\nSKILL FOCUS: Conditionals\nCreate opportunities for hypothetical discussions. Use conditional structures naturally. Help them understand and practice if-clauses.',
            'business_vocab': '\nSKILL FOCUS: Business Vocabulary\nUse business-related terminology naturally. Discuss professional topics like meetings, presentations, negotiations, and workplace situations.',
            'pronunciation': '\nSKILL FOCUS: Pronunciation\nIn your evaluation, pay special attention to pronunciation patterns. Encourage them to use audio mode if available.',
            'idioms': '\nSKILL FOCUS: Idioms & Expressions\nUse common idioms and expressions naturally in your speech. Explain their meanings when appropriate. Help them understand contextual usage.'
        }
        prompt += skill_contexts.get(skill_focus, '')
    
    # Add difficulty adjustment
    if adaptive_difficulty:
        difficulty_guidance = {
            'easy': 'DIFFICULTY: EASY - Use simple vocabulary, short sentences, and clear structures. Avoid complex grammar and idioms.',
            'medium': 'DIFFICULTY: MEDIUM - Use natural, everyday language with moderate complexity. Include some challenging vocabulary and structures.',
            'hard': 'DIFFICULTY: HARD - Use sophisticated vocabulary, complex sentence structures, and advanced grammatical forms. Include idioms and nuanced expressions.'
        }
        prompt += f"\n{difficulty_guidance.get(current_difficulty, difficulty_guidance['medium'])}"
    
    # Add bilingual mode instruction
    if bilingual_mode:
        prompt += f"\n\nBILINGUAL MODE: After your {language} response, add a line break and then provide an English translation on a new line starting with \"[EN: \" and ending with \"]\""
    
    return prompt

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        data = request.json
        conversation = data.get('conversation', {})
        # Get API key from request body (sent by backend) or from environment
        api_key = data.get('apiKey') or os.environ.get('GROQ_API_KEY')
        
        if not api_key:
            return jsonify({
                'success': False,
                'message': 'API key is required. Set GROQ_API_KEY in environment or backend .env'
            }), 400
        
        messages = conversation.get('messages', [])
        if not messages:
            return jsonify({
                'success': False,
                'message': 'No messages provided'
            }), 400
        
        # Build system prompt
        system_prompt = build_system_prompt(conversation)
        
        # Prepare messages for Groq API
        groq_messages = [
            {'role': 'system', 'content': system_prompt}
        ]
        
        # Add conversation messages (last 10 for context)
        for msg in messages[-10:]:
            groq_messages.append({
                'role': msg.get('role', 'user'),
                'content': msg.get('content', '')
            })
        
        # Call Groq API
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': DEFAULT_MODEL,
            'messages': groq_messages,
            'temperature': 0.7,
            'max_tokens': 500
        }
        
        response = requests.post(GROQ_API_URL, json=payload, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            return jsonify({
                'success': False,
                'message': error_data.get('error', {}).get('message', 'API request failed')
            }), response.status_code
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        
        return jsonify({
            'success': True,
            'response': ai_response
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/ai/evaluate', methods=['POST'])
def evaluate():
    """Handle evaluation requests"""
    try:
        data = request.json
        conversation = data.get('conversation', {})
        # Get API key from request body (sent by backend) or from environment
        api_key = data.get('apiKey') or os.environ.get('GROQ_API_KEY')
        
        if not api_key:
            return jsonify({
                'success': False,
                'message': 'API key is required. Set GROQ_API_KEY in environment or backend .env'
            }), 400
        
        messages = conversation.get('messages', [])
        if len(messages) < 2:
            return jsonify({
                'success': False,
                'message': 'Conversation must have at least 2 messages'
            }), 400
        
        language = conversation.get('language', 'Spanish')
        session_type = conversation.get('sessionType', 'freeform')
        scenario = conversation.get('scenario', '')
        skill_focus = conversation.get('skillFocus', '')
        
        # Build conversation text
        conversation_text = '\n\n'.join([
            f"{'Student' if msg.get('role') == 'user' else 'Teacher'}: {msg.get('content', '')}"
            for msg in messages
        ])
        
        # Build evaluation prompt
        goal_context = ''
        if session_type == 'scenario' and scenario:
            goal_context = f'\n\nSESSION GOAL: The student was practicing the "{scenario.replace("_", " ")}" scenario. Evaluate how well they handled this specific situation.'
        elif session_type == 'skill' and skill_focus:
            goal_context = f'\n\nSESSION GOAL: The student was focusing on "{skill_focus.replace("_", " ")}". Pay special attention to their performance in this area.'
        
        evaluation_prompt = f"""You are an expert language teacher evaluating a student's {language} conversation practice.{goal_context}

CONVERSATION TRANSCRIPT:
{conversation_text}

Please provide a comprehensive evaluation in JSON format with the following structure:
{{
    "overallScore": <number from 0-100>,
    "scoreExplanation": "<brief explanation of the score>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "areasForImprovement": ["<area 1>", "<area 2>", ...],
    "mistakes": [
        {{
            "original": "<the exact phrase the student wrote>",
            "correction": "<the corrected version>",
            "explanation": "<why this is incorrect and how to fix it>"
        }}
    ],
    "recommendations": "<overall recommendations for improvement>",
    "encouragement": "<encouraging closing message>"
}}

Analyze:
1. Grammar accuracy
2. Vocabulary usage and variety
3. Sentence structure
4. Natural flow and coherence
5. Cultural appropriateness
{f'6. Performance relative to the session goal' if session_type != 'freeform' else ''}

Be constructive, specific, and encouraging. Identify 3-5 specific mistakes if any exist.
{f'Focus especially on how well they navigated the {scenario.replace("_", " ")} scenario.' if session_type == 'scenario' else ''}
{f'Focus especially on their use of {skill_focus.replace("_", " ")}.' if session_type == 'skill' else ''}"""
        
        # Call Groq API
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': DEFAULT_MODEL,
            'messages': [
                {'role': 'system', 'content': evaluation_prompt},
                {'role': 'user', 'content': 'Please evaluate this conversation.'}
            ],
            'temperature': 0.3,
            'max_tokens': 1500
        }
        
        response = requests.post(GROQ_API_URL, json=payload, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            return jsonify({
                'success': False,
                'message': error_data.get('error', {}).get('message', 'API request failed')
            }), response.status_code
        
        result = response.json()
        response_text = result['choices'][0]['message']['content']
        
        # Parse JSON from response
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            import json
            evaluation = json.loads(json_match.group())
        else:
            # Fallback
            evaluation = {
                'overallScore': 75,
                'scoreExplanation': 'Good effort! Keep practicing.',
                'strengths': ['Engaged in conversation', 'Showed willingness to learn'],
                'areasForImprovement': ['Continue practicing regularly'],
                'mistakes': [],
                'recommendations': response_text,
                'encouragement': 'Keep up the great work!'
            }
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/ai/lifeline', methods=['POST'])
def lifeline():
    """Handle lifeline commands (hint, translate, explain)"""
    try:
        data = request.json
        command = data.get('command')
        phrase = data.get('phrase', '')
        language = data.get('language', 'Spanish')
        language_code = data.get('languageCode', 'es')
        session_type = data.get('sessionType', 'freeform')
        scenario = data.get('scenario', '')
        skill_focus = data.get('skillFocus', '')
        recent_messages = data.get('recentMessages', [])
        last_user_message = data.get('lastUserMessage', '')
        
        # Get API key from header (sent by backend) or from environment
        api_key = request.headers.get('X-API-Key') or os.environ.get('GROQ_API_KEY')
        if not api_key:
            return jsonify({
                'success': False,
                'message': 'API key is required. Set GROQ_API_KEY in environment or backend .env'
            }), 400
        
        if command == 'hint':
            hint_prompt = f"""You are helping a {language} student who is stuck and needs a hint.

Context: They are practicing {language}{f' in a {scenario.replace("_", " ")} scenario' if session_type == 'scenario' and scenario else ''}{f' focusing on {skill_focus.replace("_", " ")}' if session_type == 'skill' and skill_focus else ''}.

Recent conversation:
{chr(10).join([f"{'Student' if msg.get('role') == 'user' else 'Teacher'}: {msg.get('content', '')}" for msg in recent_messages])}

Provide a helpful hint in English that:
1. Suggests what they might want to say next
2. Offers relevant vocabulary or grammar structure
3. Encourages them to try forming a sentence
4. Is specific to the context

Keep it brief and supportive."""
            
            response = requests.post(GROQ_API_URL, json={
                'model': DEFAULT_MODEL,
                'messages': [
                    {'role': 'system', 'content': hint_prompt},
                    {'role': 'user', 'content': 'I need a hint.'}
                ],
                'temperature': 0.7,
                'max_tokens': 300
            }, headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            })
            
        elif command == 'translate':
            translate_prompt = f"""You are a translator. Translate the following word or phrase from English to {language}.

Word/Phrase: "{phrase}"

Provide:
1. The translation in {language}
2. A brief usage example in {language}
3. Any relevant pronunciation tips if applicable

Format: [Translation] - Example: [example sentence]"""
            
            response = requests.post(GROQ_API_URL, json={
                'model': DEFAULT_MODEL,
                'messages': [
                    {'role': 'system', 'content': translate_prompt},
                    {'role': 'user', 'content': phrase}
                ],
                'temperature': 0.7,
                'max_tokens': 200
            }, headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            })
            
        elif command == 'explain':
            if not last_user_message:
                return jsonify({
                    'success': True,
                    'response': 'No recent message to explain. The /explain command provides grammar explanations for your last message.'
                })
            
            explain_prompt = f"""You are a grammar teacher explaining a {language} language concept.

The student wrote: "{last_user_message}"

Recent AI response that may have corrected it:
{recent_messages[-1].get('content', 'N/A') if recent_messages else 'N/A'}

Provide a brief, clear explanation in English:
1. Identify any grammar or vocabulary issues in what they wrote
2. Explain the correct form and why
3. Give 1-2 example sentences showing correct usage
4. Be encouraging and constructive

If there were no significant errors, praise them and offer a small tip for improvement."""
            
            response = requests.post(GROQ_API_URL, json={
                'model': DEFAULT_MODEL,
                'messages': [
                    {'role': 'system', 'content': explain_prompt},
                    {'role': 'user', 'content': 'Please explain.'}
                ],
                'temperature': 0.7,
                'max_tokens': 400
            }, headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid command'
            }), 400
        
        if response.status_code != 200:
            error_data = response.json()
            return jsonify({
                'success': False,
                'message': error_data.get('error', {}).get('message', 'API request failed')
            }), response.status_code
        
        result = response.json()
        lifeline_response = result['choices'][0]['message']['content']
        
        return jsonify({
            'success': True,
            'response': lifeline_response
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Python AI service is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port, debug=True)

