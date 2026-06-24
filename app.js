/**
 * SMARTSTAND 360° - LANDING PAGE LOGIC
 * Optimized for Mobile performance & West African COD conversion
 */

// CONFIGURATION : Configurez votre numéro WhatsApp ici (sans le signe + ni les espaces)
const WHATSAPP_PHONE = "22658909806"; // Modifiez avec votre vrai numéro WhatsApp burkinabè ou guinéen

// -------------------------------------------------------------
// 1. GALERIE PHOTO INTERACTIVE
// -------------------------------------------------------------
function changeImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Mettre à jour la classe active sur les miniatures
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

// -------------------------------------------------------------
// 2. SYSTEME D'ONGLETS INTERACTIFS (TABS)
// -------------------------------------------------------------
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Retirer la classe active de tous les boutons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Masquer tous les volets
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Activer le bouton actuel
        button.classList.add('active');
        
        // Afficher le volet correspondant
        const activePane = document.getElementById(`tab-${targetTab}`);
        if (activePane) {
            activePane.classList.add('active');
        }
    });
});

// -------------------------------------------------------------
// 3. BARRE D'ACHAT COLLANTE MOBILE (STICKY BUY BAR)
// -------------------------------------------------------------
const stickyBar = document.getElementById('stickyBuyBar');
const heroSection = document.getElementById('heroSection');

if (stickyBar && heroSection) {
    window.addEventListener('scroll', () => {
        // Obtenir la position du bas de la section hero
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        
        // Afficher la barre collante si on défile au-delà du hero
        if (window.scrollY > heroBottom - 100) {
            stickyBar.classList.add('show');
        } else {
            stickyBar.classList.remove('show');
        }
    });
}

// -------------------------------------------------------------
// 4. CALCULATEUR DYNAMIQUE DE PRIX
// -------------------------------------------------------------
const orderForm = document.getElementById('orderForm');
const quantitySelect = document.getElementById('quantity');
const totalPriceDisplay = document.getElementById('totalPrice');

let pricing = {
    "1": "15 000 FCFA",
    "2": "27 000 FCFA",
    "3": "38 000 FCFA"
};

let pricingText = {
    "1": "1 Trépied (15 000 FCFA)",
    "2": "2 Trépieds (27 000 FCFA)",
    "3": "3 Trépieds (38 000 FCFA)"
};

let productName = "Trépied Intelligent 360° (+ Trépied 1m70)";

// Charger dynamiquement les configurations du produit depuis les attributs data du formulaire
if (orderForm) {
    if (orderForm.dataset.price1) {
        pricing["1"] = `${Number(orderForm.dataset.price1).toLocaleString('fr-FR')} FCFA`;
        pricing["2"] = `${Number(orderForm.dataset.price2).toLocaleString('fr-FR')} FCFA`;
        pricing["3"] = `${Number(orderForm.dataset.price3).toLocaleString('fr-FR')} FCFA`;
    }
    if (orderForm.dataset.priceText1) {
        pricingText["1"] = orderForm.dataset.priceText1;
        pricingText["2"] = orderForm.dataset.priceText2;
        pricingText["3"] = orderForm.dataset.priceText3;
    }
    if (orderForm.dataset.productName) {
        productName = orderForm.dataset.productName;
    }
}

if (quantitySelect && totalPriceDisplay) {
    // Mettre à jour le prix affiché initialement
    const initialQty = quantitySelect.value;
    if (pricing[initialQty]) {
        totalPriceDisplay.textContent = pricing[initialQty];
    }

    quantitySelect.addEventListener('change', (e) => {
        const qty = e.target.value;
        if (pricing[qty]) {
            totalPriceDisplay.textContent = pricing[qty];
        }
    });
}

// -------------------------------------------------------------
// 5. ACCORDÉONS FOIRE AUX QUESTIONS (FAQ)
// -------------------------------------------------------------
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const questionButton = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');

    if (questionButton && answerDiv) {
        questionButton.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fermer tous les autres accordéons
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Ouvrir ou fermer l'accordéon actuel
            if (!isActive) {
                item.classList.add('active');
                answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
            } else {
                item.classList.remove('active');
                answerDiv.style.maxHeight = null;
            }
        });
    }
});

// -------------------------------------------------------------
// 6. COMPTE À REBOURS DYNAMIQUE (URGENCE)
// -------------------------------------------------------------
const timerDisplay = document.getElementById('countdownTimer');

function startCountdown(durationSeconds) {
    let timer = durationSeconds;
    setInterval(() => {
        let hours = Math.floor(timer / 3600);
        let minutes = Math.floor((timer % 3600) / 60);
        let seconds = timer % 60;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (timerDisplay) {
            timerDisplay.textContent = `${hours}h : ${minutes}m : ${seconds}s`;
        }

        if (--timer < 0) {
            timer = durationSeconds; // Reset le timer pour garder l'effet d'urgence
        }
    }, 1000);
}

// Lancer le compte à rebours pour 2 heures, 14 minutes, 5 secondes (8045 secondes)
startCountdown(8045);

// -------------------------------------------------------------
// 7. FORMULAIRE : DOUBLE ENREGISTREMENT (EMAIL VIA NETLIFY + LOCAL)
// -------------------------------------------------------------
const submitButton = document.getElementById('btnSubmitOrder');

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Bloquer l'envoi classique pour traiter en JS

        // Désactiver le bouton pour éviter les doubles clics
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enregistrement...';
        }

        // Récupérer les données du formulaire
        const fullName = document.getElementById('fullName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const city = document.getElementById('city').value.trim();
        const landmark = document.getElementById('landmark').value.trim();
        const quantityVal = quantitySelect.value;
        const qtyText = pricingText[quantityVal];
        const finalPrice = pricing[quantityVal];

        // Préparer le message WhatsApp
        const whatsappMessage = `Bonjour Alfred ! Je souhaite commander le ${productName}.

Voici mes coordonnées de livraison :
👤 Nom Complet : ${fullName}
📞 Téléphone : ${phoneNumber}
📍 Ville & Quartier : ${city}
🏠 Point de repère : ${landmark ? landmark : 'Non renseigné'}
📦 Commande : ${qtyText}
💵 Total à payer : ${finalPrice}

Merci de confirmer ma commande pour la livraison !`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

        // Mettre à jour aussi le widget WhatsApp au cas où
        const whatsappWidget = document.getElementById('whatsappWidget');
        if (whatsappWidget) {
            whatsappWidget.href = whatsappUrl;
        }

        // 1. Sauvegarde locale dans le navigateur (LocalStorage) pour historique local
        try {
            const orders = JSON.parse(localStorage.getItem('promomarket_orders') || '[]');
            orders.push({
                date: new Date().toLocaleString('fr-FR'),
                fullName: fullName,
                phoneNumber: phoneNumber,
                city: city,
                landmark: landmark,
                quantity: qtyText,
                price: finalPrice
            });
            localStorage.setItem('promomarket_orders', JSON.stringify(orders));
            console.log("Commande sauvegardée localement dans commandes.html !");
        } catch (err) {
            console.error("Erreur lors de la sauvegarde locale :", err);
        }

        // 1b. Déclencher le tracking Facebook Pixel si configuré
        if (typeof fbq === 'function') {
            let numericPrice = 15000; // Valeur par défaut
            if (quantityVal === "2") numericPrice = 27000;
            if (quantityVal === "3") numericPrice = 38000;
            
            // Si des prix personnalisés sont définis dans le dataset du formulaire (ex: tondeuse)
            if (orderForm.dataset.price1) {
                const prices = {
                    "1": Number(orderForm.dataset.price1),
                    "2": Number(orderForm.dataset.price2),
                    "3": Number(orderForm.dataset.price3)
                };
                numericPrice = prices[quantityVal] || numericPrice;
            }

            fbq('track', 'Purchase', {
                value: numericPrice,
                currency: 'XOF',
                content_name: productName,
                content_type: 'product'
            });
            console.log("Événement Purchase envoyé au Pixel Facebook ! Valeur : " + numericPrice + " XOF");
        }

        // 2. Envoi silencieux à Netlify Forms en arrière-plan (déclenchera l'email)
        const formData = new FormData(orderForm);
        
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            console.log("Commande envoyée avec succès à Netlify !");
            // Rediriger le client vers son WhatsApp pour finaliser la commande
            window.location.href = whatsappUrl;
        })
        .catch(error => {
            console.error("Erreur lors de l'envoi Netlify, redirection forcée :", error);
            // Redirection forcée vers WhatsApp même en cas d'échec réseau
            window.location.href = whatsappUrl;
        });
    });
}
