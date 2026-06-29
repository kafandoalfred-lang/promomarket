// VARIABLES GLOBALES
let supabaseClient = null;
let ordersList = [];
let stocksList = [];

// DOM ELEMENTS - ÉCRAN CONNEXION
const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const btnLoginSubmit = document.getElementById('btnLoginSubmit');

// DOM ELEMENTS - ÉCRAN DASHBOARD
const dashboardScreen = document.getElementById('dashboardScreen');
const btnLogout = document.getElementById('btnLogout');
const btnExportCSV = document.getElementById('btnExportCSV');
const tableSearchInput = document.getElementById('tableSearchInput');
const ordersTableBody = document.getElementById('ordersTableBody');
const tableEmptyState = document.getElementById('tableEmptyState');

// DOM ELEMENTS - KPIS
const kpiRealCA = document.getElementById('kpiRealCA');
const kpiPotentialCA = document.getElementById('kpiPotentialCA');
const kpiDeliveryRate = document.getElementById('kpiDeliveryRate');
const kpiConfirmRate = document.getElementById('kpiConfirmRate');

// DOM ELEMENTS - STOCKS
const badgeStockTrepied = document.getElementById('badgeStockTrepied');
const badgeStockTondeuse = document.getElementById('badgeStockTondeuse');
const inputStockTrepied = document.getElementById('inputStockTrepied');
const inputStockTondeuse = document.getElementById('inputStockTondeuse');
const btnSaveStockTrepied = document.getElementById('btnSaveStockTrepied');
const btnSaveStockTondeuse = document.getElementById('btnSaveStockTondeuse');

// -------------------------------------------------------------
// 1. INITIALISATION DE L'APPLICATION
// -------------------------------------------------------------
async function initApp() {
    try {
        // 1. Charger dynamiquement les configurations via la Netlify Function
        const response = await fetch('/.netlify/functions/get-config');
        const config = await response.json();

        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            alert("Erreur de configuration : Variables d'environnement Supabase manquantes sur Netlify.");
            return;
        }

        // 2. Créer le client Supabase
        supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

        // 3. Vérifier si une session de connexion existe déjà
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            showDashboardPanel();
        } else {
            showLoginPanel();
        }
    } catch (err) {
        console.error("Erreur lors de l'initialisation de l'application :", err);
        alert("Impossible de se connecter à la base de données. Vérifiez votre connexion internet.");
    }
}

// -------------------------------------------------------------
// 2. AUTHENTIFICATION & SESSIONS
// -------------------------------------------------------------
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnLoginSubmit.disabled = true;
        btnLoginSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connexion...';
        loginError.style.display = 'none';

        const email = adminEmail.value.trim();
        const password = adminPassword.value;

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            console.log("Connexion réussie !");
            showDashboardPanel();
        } catch (err) {
            console.error("Erreur d'authentification :", err);
            loginError.textContent = "Email ou mot de passe incorrect.";
            loginError.style.display = 'block';
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.innerHTML = 'Se connecter';
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
            await supabaseClient.auth.signOut();
            showLoginPanel();
        }
    });
}

function showLoginPanel() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
    if (loginForm) loginForm.reset();
    if (btnLoginSubmit) {
        btnLoginSubmit.disabled = false;
        btnLoginSubmit.innerHTML = 'Se connecter';
    }
}

function showDashboardPanel() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    
    // Charger les données de la base
    loadDashboardData();
}

// -------------------------------------------------------------
// 3. CHARGEMENT DES DONNÉES (DASHBOARD)
// -------------------------------------------------------------
async function loadDashboardData() {
    try {
        // 1. Récupérer les commandes
        const { data: orders, error: ordersErr } = await supabaseClient
            .from('commandes')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersErr) throw ordersErr;
        ordersList = orders || [];

        // 2. Récupérer les stocks
        const { data: stocks, error: stocksErr } = await supabaseClient
            .from('stocks')
            .select('*');

        if (stocksErr) throw stocksErr;
        stocksList = stocks || [];

        // 3. Afficher les données
        renderDashboard();

    } catch (err) {
        console.error("Erreur de chargement des données :", err);
        alert("Impossible de charger les données. Votre session a peut-être expiré.");
        showLoginPanel();
    }
}

// -------------------------------------------------------------
// 4. AFFICHAGE DES KPIS, DES STOCKS ET DE LA TABLE
// -------------------------------------------------------------
function renderDashboard() {
    // 1. Calculer et afficher les KPIs
    calculateMetrics();

    // 2. Mettre à jour l'affichage des stocks
    updateStockDisplay();

    // 3. Afficher la table des commandes
    renderOrdersTable(ordersList);
}

function calculateMetrics() {
    let totalPotential = 0;
    let totalReal = 0;
    let totalOrders = ordersList.length;
    let deliveredCount = 0;
    let confirmedCount = 0;
    let cancelledCount = 0;

    ordersList.forEach(order => {
        const value = parseInt(order.numeric_price) || 0;
        totalPotential += value;

        if (order.status === 'Livré') {
            totalReal += value;
            deliveredCount++;
        } else if (order.status === 'Confirmé') {
            confirmedCount++;
        } else if (order.status === 'Annulé') {
            cancelledCount++;
        }
    });

    // Affichage des valeurs monétaires formatées en FCFA
    kpiPotentialCA.textContent = `${totalPotential.toLocaleString('fr-FR')} FCFA`;
    kpiRealCA.textContent = `${totalReal.toLocaleString('fr-FR')} FCFA`;

    // Calcul du taux de livraison : Livrés / (Livrés + Annulés)
    const processedOrders = deliveredCount + cancelledCount;
    const deliveryRate = processedOrders > 0 ? Math.round((deliveredCount / processedOrders) * 100) : 0;
    kpiDeliveryRate.textContent = `${deliveryRate}%`;

    // Calcul du taux de confirmation : (Confirmés + Livrés) / Total
    const confirmedTotal = confirmedCount + deliveredCount;
    const confirmRate = totalOrders > 0 ? Math.round((confirmedTotal / totalOrders) * 100) : 0;
    kpiConfirmRate.textContent = `${confirmRate}%`;
}

function updateStockDisplay() {
    const trepiedStock = stocksList.find(s => s.product_key === 'trepied');
    const tondeuseStock = stocksList.find(s => s.product_key === 'tondeuse');

    if (trepiedStock) {
        inputStockTrepied.value = trepiedStock.quantity;
        badgeStockTrepied.textContent = `En stock : ${trepiedStock.quantity}`;
        if (trepiedStock.quantity <= 5) {
            badgeStockTrepied.className = 'stock-badge low';
        } else {
            badgeStockTrepied.className = 'stock-badge ok';
        }
    }

    if (tondeuseStock) {
        inputStockTondeuse.value = tondeuseStock.quantity;
        badgeStockTondeuse.textContent = `En stock : ${tondeuseStock.quantity}`;
        if (tondeuseStock.quantity <= 5) {
            badgeStockTondeuse.className = 'stock-badge low';
        } else {
            badgeStockTondeuse.className = 'stock-badge ok';
        }
    }
}

function renderOrdersTable(ordersToRender) {
    ordersTableBody.innerHTML = '';

    if (ordersToRender.length === 0) {
        tableEmptyState.style.display = 'block';
        return;
    }

    tableEmptyState.style.display = 'none';

    ordersToRender.forEach(order => {
        const dateStr = new Date(order.created_at).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${dateStr}</strong></td>
            <td>
                <div class="client-name">${order.full_name}</div>
                <div class="contact-links">
                    <a href="https://wa.me/${order.phone_number.replace(/[^0-9]/g, '')}" target="_blank" class="contact-link whatsapp-link">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </a>
                    <a href="tel:${order.phone_number}" class="contact-link phone-link">
                        <i class="fa-solid fa-phone"></i> Appeler
                    </a>
                </div>
            </td>
            <td>
                <div>${order.city}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">${order.landmark || '-'}</div>
            </td>
            <td>
                <span class="product-badge">${order.product_name}</span>
                <span class="product-qty">x${order.quantity}</span>
            </td>
            <td><strong style="color: var(--success);">${parseInt(order.numeric_price).toLocaleString('fr-FR')} FCFA</strong></td>
            <td>
                <select class="status-select ${getStatusClass(order.status)}" onchange="updateOrderStatus('${order.id}', this.value, '${order.product_name}')">
                    <option value="Nouveau" ${order.status === 'Nouveau' ? 'selected' : ''}>Nouveau</option>
                    <option value="Confirmé" ${order.status === 'Confirmé' ? 'selected' : ''}>Confirmé</option>
                    <option value="Livré" ${order.status === 'Livré' ? 'selected' : ''}>Livré</option>
                    <option value="Annulé" ${order.status === 'Annulé' ? 'selected' : ''}>Annulé</option>
                </select>
            </td>
        `;
        ordersTableBody.appendChild(tr);
    });
}

function getStatusClass(status) {
    if (status === 'Confirmé') return 'status-confirme';
    if (status === 'Livré') return 'status-livre';
    if (status === 'Annulé') return 'status-annule';
    return 'status-nouveau';
}

// -------------------------------------------------------------
// 5. GESTION DES ACTIONS (STATUS & STOCKS)
// -------------------------------------------------------------
window.updateOrderStatus = async function(orderId, newStatus, productName) {
    try {
        // 1. Récupérer l'ancien statut de la commande locale
        const order = ordersList.find(o => o.id === orderId);
        const oldStatus = order ? order.status : 'Nouveau';

        if (oldStatus === newStatus) return;

        // 2. Mettre à jour en base de données
        const { error } = await supabaseClient
            .from('commandes')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) throw error;

        // 3. Gestion automatique du stock
        // Si le statut passe à "Livré", on diminue le stock
        if (newStatus === 'Livré' && oldStatus !== 'Livré') {
            await adjustProductStock(productName, -1);
        }
        // Si le statut était "Livré" et qu'on le change pour autre chose, on ré-incrémente le stock
        else if (oldStatus === 'Livré' && newStatus !== 'Livré') {
            await adjustProductStock(productName, 1);
        }

        console.log(`Commande mise à jour de ${oldStatus} vers ${newStatus}`);
        
        // Recharger les données pour actualiser le dashboard
        loadDashboardData();

    } catch (err) {
        console.error("Erreur de mise à jour du statut :", err);
        alert("Erreur lors de la mise à jour de la commande.");
    }
};

async function adjustProductStock(productName, amount) {
    // Identifier la clé de produit correspondante
    let productKey = '';
    if (productName.toLowerCase().includes('trépied') || productName.toLowerCase().includes('tripod')) {
        productKey = 'trepied';
    } else if (productName.toLowerCase().includes('tondeuse') || productName.toLowerCase().includes('trimmer')) {
        productKey = 'tondeuse';
    }

    if (!productKey) return;

    // Trouver le stock actuel
    const currentStock = stocksList.find(s => s.product_key === productKey);
    if (!currentStock) return;

    const newQuantity = Math.max(0, currentStock.quantity + amount);

    // Mettre à jour en base de données
    const { error } = await supabaseClient
        .from('stocks')
        .update({ quantity: newQuantity })
        .eq('product_key', productKey);

    if (error) {
        console.error("Erreur de mise à jour du stock :", error);
    }
}

// Enregistrement manuel des stocks
if (btnSaveStockTrepied) {
    btnSaveStockTrepied.addEventListener('click', async () => {
        const val = parseInt(inputStockTrepied.value) || 0;
        await saveStockManual('trepied', val);
    });
}

if (btnSaveStockTondeuse) {
    btnSaveStockTondeuse.addEventListener('click', async () => {
        const val = parseInt(inputStockTondeuse.value) || 0;
        await saveStockManual('tondeuse', val);
    });
}

async function saveStockManual(productKey, quantity) {
    try {
        const { error } = await supabaseClient
            .from('stocks')
            .update({ quantity: quantity })
            .eq('product_key', productKey);

        if (error) throw error;

        console.log(`Stock mis à jour pour ${productKey} : ${quantity}`);
        loadDashboardData();
        alert("Stock mis à jour avec succès !");
    } catch (err) {
        console.error("Erreur de sauvegarde du stock :", err);
        alert("Impossible de mettre à jour le stock.");
    }
}

// -------------------------------------------------------------
// 6. RECHERCHE & EXPORT EXCEL (CSV)
// -------------------------------------------------------------
if (tableSearchInput) {
    tableSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = ordersList.filter(order => {
            return (
                order.full_name.toLowerCase().includes(query) ||
                order.phone_number.includes(query) ||
                order.city.toLowerCase().includes(query) ||
                (order.landmark && order.landmark.toLowerCase().includes(query)) ||
                order.product_name.toLowerCase().includes(query) ||
                order.status.toLowerCase().includes(query)
            );
        });
        renderOrdersTable(filtered);
    });
}

if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
        if (ordersList.length === 0) {
            alert("Aucune commande à exporter.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM pour Excel accents
        csvContent += "Date;Nom complet;Telephone;Ville;Quartier/Repere;Produit;Quantite;Prix Total;Statut;OrderID\r\n";

        ordersList.forEach(order => {
            const dateStr = new Date(order.created_at).toLocaleDateString('fr-FR');
            const row = [
                dateStr,
                order.full_name,
                order.phone_number,
                order.city,
                order.landmark || '',
                order.product_name,
                order.quantity,
                order.numeric_price,
                order.status,
                order.order_id || ''
            ].map(text => `"${text.toString().replace(/"/g, '""')}"`).join(";");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `commandes_promomarket_${new Date().toLocaleDateString('fr-FR')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Initialiser l'application au démarrage de la page
window.onload = initApp;
