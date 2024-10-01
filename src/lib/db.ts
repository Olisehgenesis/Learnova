import { supabase } from './supabase'

export async function initializeTables() {
    const client = supabase.rest;

    // Check and create documents table
    const { error: documentsError } = await client.rpc('CREATE_TABLE_IF_NOT_EXISTS', {
        table_name: 'documents',
        table_definition: `
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `
    });
    if (documentsError) console.error('Error creating documents table:', documentsError);

    // Check and create quizzes table
    const { error: quizzesError } = await client.rpc('CREATE_TABLE_IF_NOT_EXISTS', {
        table_name: 'quizzes',
        table_definition: `
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id),
      questions JSONB NOT NULL,
      num_questions INTEGER NOT NULL,
      required_pass_score INTEGER NOT NULL,
      limit_takers BOOLEAN NOT NULL,
      taker_limit INTEGER,
      total_rewards_usdc NUMERIC(10, 2) NOT NULL,
      total_rewards_tokens NUMERIC(10, 6) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `
    });
    if (quizzesError) console.error('Error creating quizzes table:', quizzesError);

    // Check and create quiz_attempts table
    const { error: attemptsError } = await client.rpc('CREATE_TABLE_IF_NOT_EXISTS', {
        table_name: 'quiz_attempts',
        table_definition: `
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER REFERENCES quizzes(id),
      user_answers JSONB NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `
    });
    if (attemptsError) console.error('Error creating quiz_attempts table:', attemptsError);
}


export async function saveDocument(content: string, summary: string) {
    const { data, error } = await supabase
        .from('documents')
        .insert({ content, summary })
        .select()

    if (error) throw error
    return data[0].id
}

export async function saveQuiz(
    documentId: number,
    questions: string,
    numQuestions: number,
    requiredPassScore: number,
    limitTakers: boolean,
    takerLimit: number | null,
    totalRewardsUSDC: number
) {
    const totalRewardsTokens = totalRewardsUSDC / 0.00654
    const { data, error } = await supabase
        .from('quizzes')
        .insert({
            document_id: documentId,
            questions,
            num_questions: numQuestions,
            required_pass_score: requiredPassScore,
            limit_takers: limitTakers,
            taker_limit: takerLimit,
            total_rewards_usdc: totalRewardsUSDC,
            total_rewards_tokens: totalRewardsTokens
        })
        .select()

    if (error) throw error
    return data[0].id
}

export async function saveQuizAttempt(quizId: number, userAnswers: string, score: number) {
    const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({ quiz_id: quizId, user_answers: userAnswers, score })
        .select()

    if (error) throw error
    return data[0].id
}

export async function getQuizzes() {
    const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getQuizById(id: number) {
    const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function getDocumentById(id: number) {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}