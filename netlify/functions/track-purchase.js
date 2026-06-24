const https = require('https');
const crypto = require('crypto');

/**
 * Hacher une chaîne en SHA-256 comme requis par Meta pour la confidentialité
 */
function hashSHA256(data) {
    if (!data) return null;
    const cleaned = data.toString().trim().toLowerCase();
    return crypto.createHash('sha256').update(cleaned).digest('hex');
}

exports.handler = async (event, context) => {
    // Gérer le CORS pré-vol (preflight request OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ''
        };
    }

    // Autoriser uniquement les requêtes POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { fullName, phoneNumber, productName, value, currency, orderId } = body;

        // Récupérer le token d'accès depuis les variables d'environnement de Netlify
        const accessToken = process.env.META_ACCESS_TOKEN;
        const pixelId = '1580750226796883'; // ID du Pixel d'Alfred

        if (!accessToken) {
            console.error("META_ACCESS_TOKEN n'est pas configuré dans les variables d'environnement de Netlify !");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Configuration Error: META_ACCESS_TOKEN is missing' })
            };
        }

        // Normalisation simple du numéro de téléphone pour l'Afrique de l'Ouest
        let cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
        // Si c'est un numéro local burkinabè à 8 chiffres (ex: 70000000), on ajoute l'indicatif pays
        if (cleanPhone.length === 8) {
            cleanPhone = '226' + cleanPhone;
        }

        // Hachage des données d'identification (exigé par Facebook)
        const hashedPhone = hashSHA256(cleanPhone);
        const hashedName = hashSHA256(fullName);

        // Récupérer l'IP du client et le User Agent depuis les en-têtes Netlify
        const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '';
        const clientUserAgent = event.headers['user-agent'] || '';

        // Préparation du payload pour l'API de Conversions de Meta
        const metaEventPayload = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: orderId, // Identifiant unique partagé avec le Pixel navigateur pour le dédoublonnement
                    event_source_url: event.headers['referer'] || '',
                    action_source: 'website',
                    user_data: {
                        ph: hashedPhone ? [hashedPhone] : [],
                        fn: hashedName ? [hashedName] : [],
                        client_ip_address: clientIp,
                        client_user_agent: clientUserAgent
                    },
                    custom_data: {
                        value: parseFloat(value) || 15000,
                        currency: currency || 'XOF',
                        content_name: productName || 'Produit PromoMarket',
                        content_type: 'product'
                    }
                }
            ]
        };

        const postData = JSON.stringify(metaEventPayload);
        
        // Configuration de la requête HTTPS
        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: `/v19.0/${pixelId}/events?access_token=${accessToken}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // Exécution de la requête HTTPS vers Meta Graph API
        const responseBody = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        body: data
                    });
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.write(postData);
            req.end();
        });

        console.log(`Réponse Meta Conversions API (Status ${responseBody.statusCode}):`, responseBody.body);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                success: responseBody.statusCode === 200, 
                statusCode: responseBody.statusCode,
                details: JSON.parse(responseBody.body)
            })
        };

    } catch (error) {
        console.error("Erreur serveur dans la fonction Netlify track-purchase :", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
        };
    }
};
