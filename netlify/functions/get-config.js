exports.handler = async (event, context) => {
    // Gérer le CORS pré-vol
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: ''
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            supabaseUrl: process.env.SUPABASE_URL || "",
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
        })
    };
};
