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

/**
 * Insérer une commande dans la table Supabase via son API REST native (HTTPS)
 */
function insertOrderToSupabase(url, anonKey, orderData) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(orderData);
        const cleanUrl = url.replace(/\/$/, ""); // Enlever le slash final si présent
        const hostname = cleanUrl.replace("https://", "");
        
        const options = {
            hostname: hostname,
            port: 443,
            path: '/rest/v1/commandes',
            method: 'POST',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
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
        const { fullName, phoneNumber, productName, value, currency, orderId, quantity, price, testEventCode } = body;

        // -------------------------------------------------------------
        // 1. GESTION DES CLÉS DE CONFIGURATION
        // -------------------------------------------------------------
        const accessToken = process.env.META_ACCESS_TOKEN;
        const pixelId = '1580750226796883'; // ID du Pixel d'Alfred
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        // Normalisation simple du numéro de téléphone
        let cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
        if (cleanPhone.length === 8) {
            cleanPhone = '226' + cleanPhone; // Burkina par défaut
        }

        const promises = [];

        // -------------------------------------------------------------
        // 2. ENVOI A META CONVERSIONS API
        // -------------------------------------------------------------
        if (accessToken) {
            const hashedPhone = hashSHA256(cleanPhone);
            const hashedName = hashSHA256(fullName);
            const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '';
            const clientUserAgent = event.headers['user-agent'] || '';

            const metaEventPayload = {
                data: [
                    {
                        event_name: 'Purchase',
                        event_time: Math.floor(Date.now() / 1000),
                        event_id: orderId,
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

            if (testEventCode) {
                metaEventPayload.test_event_code = testEventCode;
            }

            const postData = JSON.stringify(metaEventPayload);
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

            const metaPromise = new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        resolve({ source: 'Meta', statusCode: res.statusCode, body: data });
                    });
                });
                req.on('error', (e) => {
                    resolve({ source: 'MetaError', error: e.message });
                });
                req.write(postData);
                req.end();
            });
            promises.push(metaPromise);
        } else {
            console.warn("META_ACCESS_TOKEN non configuré.");
        }

        // -------------------------------------------------------------
        // 3. ENVOI A SUPABASE (BASE DE DONNEES)
        // -------------------------------------------------------------
        if (supabaseUrl && supabaseAnonKey) {
            const orderData = {
                full_name: fullName,
                phone_number: cleanPhone,
                city: body.city || 'Non spécifiée',
                landmark: body.landmark || 'Non spécifié',
                product_name: productName,
                quantity: parseInt(quantity) || 1,
                price: price || `${value} FCFA`,
                numeric_price: parseInt(value) || 15000,
                order_id: orderId,
                status: 'Nouveau'
            };

            const supabasePromise = insertOrderToSupabase(supabaseUrl, supabaseAnonKey, orderData)
                .then(res => {
                    return { source: 'Supabase', statusCode: res.statusCode, body: res.body };
                })
                .catch(err => {
                    return { source: 'SupabaseError', error: err.message };
                });
            promises.push(supabasePromise);
        } else {
            console.warn("Variables d'environnement Supabase non configurées.");
        }

        // Attendre la résolution de toutes les intégrations en parallèle
        const results = await Promise.all(promises);
        console.log("Résultats des intégrations :", results);

        // Trouver le statut de la réponse
        const metaResult = results.find(r => r.source === 'Meta');
        const supabaseResult = results.find(r => r.source === 'Supabase');

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                meta: metaResult ? { statusCode: metaResult.statusCode } : null,
                supabase: supabaseResult ? { statusCode: supabaseResult.statusCode } : null
            })
        };

    } catch (error) {
        console.error("Erreur globale dans la fonction Netlify :", error);
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
