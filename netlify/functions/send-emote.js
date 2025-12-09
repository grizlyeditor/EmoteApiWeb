// Netlify Function for sending email notifications
exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const data = JSON.parse(event.body);
        const { type, message, recipient } = data;
        
        // Validate input
        if (!type || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }
        
        // Log the emote (in production, you would send an email here)
        console.log('Emote received:', { type, message, recipient, timestamp: new Date().toISOString() });
        
        // For demo purposes, we'll simulate email sending
        const response = {
            success: true,
            message: `Emote sent successfully! Type: ${type}`,
            timestamp: new Date().toISOString(),
            data: {
                type,
                message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
                recipient: recipient || 'admin@example.com'
            }
        };
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(response)
        };
        
    } catch (error) {
        console.error('Error in send-emote function:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};
